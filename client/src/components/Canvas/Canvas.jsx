import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hero from '../../models/Hero';
import Background from '../../models/Background';
import Points from '../../models/Points';

import "./Canvas.css";

class Canvas extends Component {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this);
		this.draw = this.draw.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		// ref
		this.canvasRef = React.createRef();
	}

	static propTypes = {
		user: PropTypes.shape({
			username: PropTypes.string
		}),
		socket: PropTypes.object
	}

	config = {
		last: 0,
		fps: 60
	}

	ctx = null
	background = null
	points = []
	users = []
	allPoints = []
	privateSocket = ''

	abstractLayer = {
		width: 5000,
		height: 5000
	}

	animation = null

	componentDidMount() {
		this.init();
	}

	componentWillUnmount() {
		this.props.socket.disconnect();
		this.canvasRef.current.removeEventListener('resize', this.onResize, false);
	}

	init() {
		this.canvasRef.current.width = window.innerWidth;
		this.canvasRef.current.height = window.innerHeight;
		this.ctx = this.canvasRef.current.getContext('2d');
		//
		this.props.socket.emit("join", {
			username: this.props.user.username,
			canvasWidth: this.canvasRef.current.width,
			canvasHeight: this.canvasRef.current.height
		});

		this.props.socket.on('refreshUsers', data => {
			this.users = data.users;
			this.allPoints = data.points;
		});

		this.props.socket.on('lostGame', data => {
			window.cancelAnimationFrame(this.animation);
			this.props.history.replace("/lost");
		});

		this.props.socket.on("startGame", data => {
			this.users = data.users;
			this.allPoints = data.points;
			this.privateSocket = data.socket;
			//
			window.addEventListener('mousemove', this.handleMouseMove, false);
			//
			const user = {
				username: this.props.user.username
			};

			this.hero = new Hero(this.ctx, this.canvasRef.current, this.abstractLayer, this.privateSocket, this.users, user, this.props.socket);
			//
			this.points = new Points(this.ctx, this.canvasRef.current, this.allPoints);
			//			
			this.background = new Background(this.ctx, this.canvasRef.current, this.abstractLayer);
			//
			this.draw();
		});

		this.props.socket.on('privateSocket', data => {
			this.privateSocket = data.socket;
		});
	}

	draw(time) {
		this.animation = window.requestAnimationFrame(this.draw);

		if(time-this.config.last >= 1000/this.config.fps) {
			this.config.last = time;
			this.ctx.clearRect(0,0,this.canvasRef.current.width,this.canvasRef.current.height);
			//
			this.background.inject(this.hero.getHeroData(), "hero");
			this.background.draw();
			//
			this.points.inject(this.hero.getHeroData(), "hero");
			this.points.inject(this.allPoints, "points");
			this.points.draw();
			//
			this.hero.inject(this.privateSocket, "privateSocket");
			this.hero.inject(this.users, "users");
			this.hero.inject(this.allPoints, "points");
			this.hero.draw();
			//
			this.props.socket.emit('dataExchange', {
				heroData: this.hero.getHeroData()
			});
		}
	}

	handleMouseMove(e) {
		this.hero.mouseMove(e.clientX, e.clientY);
	}

	render() {
		return (
			<canvas ref={this.canvasRef}/>
		);
	}
}

export default Canvas;