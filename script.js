const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = parseInt(window.innerWidth)
canvas.height = parseInt(window.innerHeight)

function game_update(){
	ctx.clearRect(0,0,canvas.width, canvas.height)
  	ctx.fillStyle = "#071844"
  	ctx.fillRect(0,0,canvas.width, canvas.height)
}


class Ball{
	constructor(x,y,radius){
		this.x = x
		this.y = y 
		this.radius = radius
		this.velocity = {x:0, y:0}

		this.image = new Image()
		this.image.src = "assets\\main\\Guard.png"

		this.mouse_move_position = [0,0]

		this.accelerator = 0 
	}
	draw(){
		ctx.drawImage(this.image, this.x-this.radius*1.75, this.y-this.radius*1.9, this.radius*3.5, this.radius*3.5)
	}
	gizmos_line(){
		ctx.beginPath();
		ctx.strokeStyle = "#FFFFFF"
		ctx.lineWidth = 8
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
	}
	distance(position01, position02){
		let vector = [position02[0]-position01[0],position02[1]-position01[1]] 
		return Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1])
	}
	normalize(position01, position02){
		let vector = [position02[0]-position01[0],position02[1]-position01[1]]
		return [vector[0]/this.distance(position01, position02), vector[1]/this.distance(position01, position02)]
	}
	MouseMoveDefinePosition(event){
		this.mouse_move_position = [event.clientX, event.clientY] 
	}
	update(){

		let prev_position = [this.x, this.y]
		this.x = this.mouse_move_position[0]
		this.y = this.mouse_move_position[1]

		this.accelerator = this.distance(prev_position, [this.x,this.y]) 

		this.draw()
		//this.gizmos_line()
	}
}

class Square{
	constructor(x,y,scale){
		this.x = x
		this.y = y

		this.velocity = {x:0, y:0}

		this.square = []
		this.collision_points = []
		this.square_init()

		this.image = new Image()
		this.config_presets = [{image:"assets\\obstacles\\drink_bank.png", degrees: Math.floor(Math.random()*4)*90+45, rect_define:30, scale: 85},
							   {image:"assets\\obstacles\\chocolate_baton.png", degrees: Math.floor(Math.random()*4)*90+45, rect_define:-60, scale: 110}]

		this.index = this.random_picture_choose()
		this.image.src = this.config_presets[this.index].image

		this.degrees = this.config_presets[this.index].degrees * Math.PI/180 + 0.001
		this.rect_define = this.config_presets[this.index].rect_define

		this.scale = this.config_presets[this.index].scale
	
		//this.rotation_speed = 0

		this.mouse_pos = [0,0]

		this.gravity = 2

		this.collision_points = []
	}
	random_picture_choose(){
		return Math.floor(Math.random()*this.config_presets.length)
	}
	collision_points_init(){
		this.collision_points = []
		for(let index in this.square){
			if(index<2){
				continue
			}
			this.collision_points.push({x:this.square[index].x + (this.square[index-1].x-this.square[index].x)/3,
										y:this.square[index].y + (this.square[index-1].y-this.square[index].y)/3})
			this.collision_points.push({x:this.square[index].x + (this.square[index-1].x-this.square[index].x)/3*2,
										y:this.square[index].y + (this.square[index-1].y-this.square[index].y)/3*2})
		}
		let max = this.square.length-1
		this.collision_points.push({x:this.square[max].x + (this.square[1].x-this.square[max].x)/3,
									y:this.square[max].y + (this.square[1].y-this.square[max].y)/3})
		this.collision_points.push({x:this.square[max].x + (this.square[1].x-this.square[max].x)/3*2,
									y:this.square[max].y + (this.square[1].y-this.square[max].y)/3*2})

		//this.gizmos_collision_point()
	}
	gizmos_collision_point(){
		for(let index in this.collision_points){
			ctx.beginPath()
			ctx.arc(this.collision_points[index].x, this.collision_points[index].y, 20, 0, Math.PI*2)
			ctx.stroke()
		}
	}
	square_init(){
		for(let i=0; i<5; i++){
			this.square.push({x:this.x,y:this.y})
		}

	}
	rotate(){
		//this.degrees += this.rotation_speed

		let rect_define = this.rect_define


		for(let index in this.square){
		if(index == 0){
			continue
		}
		
		this.square[index].x = this.square[0].x + this.scale * Math.sin(this.degrees+(index+1)*Math.PI/4+rect_define*Math.PI/360) 
		this.square[index].y = this.square[0].y + this.scale * Math.cos(this.degrees+(index+1)*Math.PI/4+rect_define*Math.PI/360)
		rect_define = -rect_define
	    }
	    this.collision_points_init() 
	}
	line_condition(pos01, pos02, collision_pos){
		// Creating straight line above square (rectangle) side

		let vector = [pos02[0]-pos01[0],pos02[1]-pos01[1]]

		let center_pos_rect = [this.square[0].x,this.square[0].y]
		let center_point_side = [vector[0]/2+pos01[0], vector[1]/2+pos01[1]]

		let tan = vector[1]/vector[0]

		if(center_point_side[1]>center_pos_rect[1]){
			if(tan*collision_pos[0]+(pos01[1]-tan*pos01[0]) > collision_pos[1]){
				return true
			}
		}else if(center_point_side[1]<center_pos_rect[1]){
			if(tan*collision_pos[0]+(pos01[1]-tan*pos01[0]) < collision_pos[1]){
				return true
			}
		}

		return false
	}
	collision_2d_detect(collision_pos){
		// Using Line Condition function creating close space from which we get bool answer

		let conditions = []
		let length = this.square.length
		for(let index in this.square){
			if(index < 2){
				continue
			}
			conditions.push(this.line_condition([this.square[index-1].x, this.square[index-1].y], [this.square[index].x, this.square[index].y], collision_pos))
		}
		conditions.push(this.line_condition([this.square[length-1].x, this.square[length-1].y],[this.square[1].x, this.square[1].y],collision_pos))

		for(let index in conditions){
			if(!conditions[index]){
				return false
			}
		}
		return true
	}
	distance(pos01, pos02){
		let vector = [pos02[0]-pos01[0], pos02[1]-pos01[1]]
		return Math.sqrt(vector[0]**2+vector[1]**2)
	}
	normalize(pos01, pos02){
		let vector = [pos02[0]-pos01[0], pos02[1]-pos01[1]]
		return [vector[0]/this.distance(pos01, pos02), vector[1]/this.distance(pos01, pos02)]
	}
	square_collision(all_squares){
		for(let square in all_squares){
			if(all_squares[square]==this){
				continue
			}
			let dir = this.normalize([this.square[0].x, this.square[0].y], [all_squares[square].square[0].x, all_squares[square].square[0].y])
			let counter = 0
			for(let point in all_squares[square].collision_points){
				if(this.collision_2d_detect([all_squares[square].collision_points[point].x, all_squares[square].collision_points[point].y])){
					while(this.collision_2d_detect([all_squares[square].collision_points[point].x, all_squares[square].collision_points[point].y])){
						this.x = all_squares[square].square[0].x - dir[0]*(this.scale-this.rect_define)*0.5 - dir[0] * counter
						this.y = all_squares[square].square[0].y - dir[1]*(this.scale-this.rect_define)*0.5 - dir[1] * counter
						this.update()
						counter += 0.5
					}
					this.velocity.x = dir[0]
					this.velocity.y = dir[1]
			}
		  }
		}
	}

	ball_collision(ball){
		let dir = this.normalize([ball.x,ball.y],[this.x,this.y])
		let counter = 1
		if(this.collision_2d_detect([ball.x+dir[0]*ball.radius, ball.y+dir[1]*ball.radius])){
			while(this.collision_2d_detect([ball.x+dir[0]*ball.radius, ball.y+dir[1]*ball.radius])){
				this.x = ball.x + dir[0]*ball.radius + dir[0]*counter
				this.y = ball.y + dir[1]*ball.radius + dir[1]*counter
				this.update()
				counter += 1
			}
			this.velocity.x = dir[0] * (ball.accelerator*0.5+2)
			this.velocity.y = dir[1] * (ball.accelerator*0.5+2)
		}
		
	}
	get_mouse_pos(mouse_pos){
		this.mouse_pos = mouse_pos
	}
	draw_rotated(){
		ctx.save()
		ctx.translate(this.x, this.y)
		ctx.rotate(-this.degrees)
		ctx.drawImage(this.image, -this.scale*1.1, -this.scale*1.1, this.scale*2.2, this.scale*2.2)
		ctx.restore()
	}
	gizmos_line(){
		ctx.beginPath();
		for(let index in this.square){
			if(index<=1){
			  continue
			}
			ctx.moveTo(this.square[index-1].x, this.square[index-1].y)
			ctx.lineTo(this.square[index].x, this.square[index].y)
		}
		ctx.moveTo(this.square[this.square.length-1].x, this.square[this.square.length-1].y)
		ctx.lineTo(this.square[1].x, this.square[1].y)
		ctx.strokeStyle = "#FFFFFF"
		ctx.lineWidth = 8
		ctx.stroke()
	}
	update(){
		this.square[0].x = this.x
		this.square[0].y = this.y

		this.x += this.velocity.x
		this.y += this.velocity.y + this.gravity

		this.rotate()
	}
	
}

class spawnSquares{
	constructor(ball, game_over){
		this.squares = []
		this.ball = ball
		this.game_over = game_over
	}
	append(square){
		this.squares.push(square)
	}
	update(){
		for(let index in this.squares){
			this.squares[index].update()
			this.squares[index].draw_rotated()
			//this.squares[index].gizmos_line()
			this.squares[index].ball_collision(this.ball)
			this.squares[index].square_collision(this.squares)
			this.clear_squares_out_area(index)
		}
	}
	clear_squares_out_area(index){
		if(this.squares[index]!=null && this.squares[index].x<-this.squares[index].scale*2 || this.squares[index].x>canvas.width+this.squares[index].scale*2){
			delete this.squares[index]
		}
		if(this.squares[index]!=null && this.squares[index].y>canvas.height+this.squares[index].scale*2){
			delete this.squares[index]
			this.game_over.state = true
		}
	}

}
class Stars{
	constructor(){
		this.positions = [[Math.random()*canvas.width, Math.random()*canvas.height]]
		this.scale = canvas.width*0.02
		this.distance = 250
		
		this.img = new Image()
		this.img.src = "assets\\star\\Star.svg"

		this.last_created_star = []
	}
	draw(position){
		ctx.drawImage(this.img, position[0], position[1], this.scale, this.scale)
	}
	distance_func(position01, position02){
		let vector = [position02[0]-position01[0],position02[1]-position01[1]] 
		return Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1])
	}
	check_distance(){
		for(let index in this.positions){
			if(this.distance_func(this.last_created_star, this.positions[index]) < this.distance){
				return false
			}
		}
		return true
	}
	scatter_generator(original_star){
		let degrees = Math.floor(Math.random()*15)*24
		this.last_created_star = [Math.sin(degrees)*this.distance+original_star[0], Math.cos(degrees)*this.distance+original_star[1]]
		if(this.check_distance()){
		if(this.last_created_star[0] > -this.scale*2 && this.last_created_star[1] > -this.scale*20 && this.last_created_star[0] < canvas.width+this.scale*2 && this.last_created_star[1] < canvas.height+this.scale*2){
		this.positions.push(this.last_created_star)
	    }
		}
	}
	clear_stars(index){
		if(this.positions[index][1]>canvas.height + this.scale*2){
			delete this.positions[index]
		}
	}

	clear_undefined(){
		let cleared_list = []
		for(let index in this.positions){
			if(this.positions[index] != null){
			cleared_list.push(this.positions[index])
		}
		}
		this.positions = cleared_list
	}
	
	generate(frequency){
		for(let index = 0; index < canvas.width*canvas.height/stars.distance/stars.distance*frequency; index++){
		for(let index in this.positions){
			this.scatter_generator(this.positions[index])
			this.clear_stars(index)
		}
	    }
	    this.clear_undefined()
	}
	update(){
		for(let index in this.positions){
		this.draw(this.positions[index])
	    }
	}
}

class backgroundElement{
	constructor(x,y,img,scale){
		this.x = x
		this.y = y
		
		this.img = new Image()
		this.img.src = img
		
		this.scale = scale
	}
	draw(){
		ctx.drawImage(this.img, this.x, this.y, this.scale, this.scale)
	}
}

class Planet{
	constructor(x,y,img,scale){
		this.x = x
		this.y = y

		this.velocity = {x:0, y:0}

		this.floating_value = 0
		this.fly_dir = 1
		
		this.img = new Image()
		this.img.src = img
		
		this.scale = scale
	}
	draw(){
		ctx.drawImage(this.img, this.x, this.y, this.scale, this.scale)
	}
	floating(){
		if(this.floating_value > 0.25){
		this.floating_value = 0
		this.fly_dir = -this.fly_dir
		}
		this.floating_value += 0.01
	}
	update(){
		this.y += this.floating_value*this.fly_dir
		this.floating()
		this.draw()
	}
}

class Camera{
	constructor(backgroundObjects, stars, squares, main, guard){
		this.backgroundObjects = backgroundObjects
		this.speed = 0.2
		
		this.stars = stars
		this.squares = squares

		this.main = main
		this.guard = guard

		this.save()
	}
	
	move_up(){
		this.accelerate()
		for(let index in this.backgroundObjects){
			this.backgroundObjects[index].y += this.speed
		}
		for(let index in this.stars.positions){
			this.stars.positions[index][1] += this.speed*0.5
		}
	}

	wiggle(){
		let rand = Math.random()*Math.PI*2
		let rand_vector = {x:Math.sin(rand)*2, y:Math.cos(rand)*2}
		for(let index in this.backgroundObjects){
			this.backgroundObjects[index].x += rand_vector.x
			this.backgroundObjects[index].y += rand_vector.y
		}
		for(let index in this.stars.positions){
			this.stars.positions[index][0] += rand_vector.x
			this.stars.positions[index][1] += rand_vector.y
		}
		for(let index in this.squares.squares){
			this.squares.squares[index].x += rand_vector.x
			this.squares.squares[index].y += rand_vector.y
		}
		this.main.x += rand_vector.x
		this.main.y += rand_vector.y
		this.guard.mouse_move_position[0] += rand_vector.x
		this.guard.mouse_move_position[1] += rand_vector.y
	}
	save(){
		this.saved = {backgroundObjects: {x:[], y:[]}, stars:[], main:{x:0, y:0}, guard:{x:0, y:0}}
		for(let index in this.backgroundObjects){
			this.saved.backgroundObjects.x.push(this.backgroundObjects[index].x)
			this.saved.backgroundObjects.y.push(this.backgroundObjects[index].y)
		}
		for(let index in this.stars.positions){
			this.saved.stars.push(this.stars.positions[index])
		}
		this.saved.main = {x:this.main.x, y:this.main.y}
		this.saved.guard = {x: this.guard.mouse_move_position[0], y:this.guard.mouse_move_position[1]} 
	}

	load(){
		for(let index in this.backgroundObjects){
			this.backgroundObjects[index].x = this.saved.backgroundObjects.x[index]
			this.backgroundObjects[index].y = this.saved.backgroundObjects.y[index]
		}
		for(let index in this.saved.stars){
			this.stars.positions[index] = this.saved.stars[index]
		}
		this.main.x = this.saved.main.x
		this.main.y = this.saved.main.y
		this.guard.mouse_move_position[0] = this.saved.guard.x
		this.guard.mouse_move_position[1] = this.saved.guard.y
	}
	
	accelerate(){
		if(this.speed < 1){
		this.speed += 0.05
		}
	}
	
}

class GameOver{
	constructor(fps){
		this.state = false

		this.startup_opacity = 0
		this.text01_opacity = 0
		this.text02_opacity = 0

		this.fps = fps
		this.timer = fps * 4
	}
	startup(){
		if(this.state){
		if(this.startup_opacity < 1){
			this.startup_opacity += 0.005
		}
		ctx.globalAlpha = this.startup_opacity
		ctx.fillStyle = "#FFFFFF"
		ctx.fillRect(0,0, canvas.width, canvas.height)
		ctx.globalAlpha = 1
	  }
	}
	text01(){
		if(this.state){
		this.timer -= 1
		if(this.timer < 0){
		if(this.text01_opacity < 1){
			this.text01_opacity += 0.01
		}
		ctx.globalAlpha = this.text01_opacity
		ctx.fillStyle = "#B41875"
		ctx.font = "50px Orbitron"
		ctx.fillText("Game Over", canvas.width/2-50*3, canvas.height/2-50)
		ctx.globalAlpha = 1
		}
		}
	}
	text02(final_points){
		if(this.state){
		if(this.timer < 0){
		this.timer -= 1
		}
		if(this.timer < -fps * 1){
		if(this.text02_opacity < 1){
			this.text02_opacity += 0.01
		}
		ctx.globalAlpha = this.text02_opacity
		ctx.fillStyle = "#B41875"
		ctx.font = "40px Orbitron"
		ctx.fillText(final_points.toString().padStart(6,"0"), canvas.width/2-40*2.5, canvas.height/2)
		ctx.globalAlpha = 1
		}
		}
	}
}

function credits(){
	ctx.globalAlpha = 0.5
	ctx.font = "400 25px Roboto"
	ctx.fillStyle = "#000000"
	ctx.fillText("@ Youtube-channel: breaddays8574", canvas.width-425, canvas.height-25)
	ctx.globalAlpha = 1
}
let fps = 60

let ball = new Ball(150,150,60)

let game_over = new GameOver(fps=60)
let final_points = 0

let spawn_squares = new spawnSquares(ball, game_over)

let square_counter = 0
let counter = 0

let stars =  new Stars()

let buildings = new backgroundElement(-canvas.width*0.27,-canvas.width*0.95+canvas.height,"assets\\buildings\\buildings.png",canvas.width*1.5)
let ground = new backgroundElement(0,canvas.height-canvas.width*0.07, "assets\\ground\\ground.svg", canvas.width)
let trash01 = new backgroundElement(-canvas.width*0.015,canvas.height-canvas.width/5, "assets\\trash\\Trash01.png", canvas.width/5)
let trash02 = new backgroundElement(canvas.width*0.85,canvas.height-canvas.width/5, "assets\\trash\\Trash02.png", canvas.width/5)

let main = new Planet(canvas.width/2-canvas.width/8, canvas.height*0.95-canvas.width/4, "assets\\main\\Main.png", canvas.width/4)

let camera = new Camera([buildings, ground, trash01, trash02], stars = stars, squares = spawn_squares, main, ball)
stars.generate(1)


function animate () {
	setTimeout(() => {
    	window.requestAnimationFrame(animate);
  	}, 1000 / fps);

  	game_update()
	
	stars.update()
	
	buildings.draw()
	ground.draw()
	trash01.draw()
	trash02.draw()
	main.update()

  	if(counter >= fps){
  	stars.generate(0.05)
  	counter = 0
  	if(!game_over.state){
  	final_points += 1
  	}
    }
    counter += 1

    if(!game_over.state){
    if(square_counter >= fps*5){
    spawn_squares.append(new Square((Math.random()+0.15)*(canvas.width*(1-0.15)),-50,85))
    square_counter = 0
    }

    spawn_squares.update()
    square_counter += 1
	}

	camera.save()
    camera.load()
	
	camera.move_up()

	if(game_over.state){
	camera.wiggle()
	}
	
  	ball.update()

  	game_over.startup()

  	game_over.text01()
  	game_over.text02(final_points)

  	credits()
 }

 animate()

 canvas.addEventListener("mousemove", function (event) {
  	ball.MouseMoveDefinePosition(event)
})
