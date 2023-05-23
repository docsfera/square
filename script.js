const canvas = document.getElementById("canvas")
const button = document.querySelector(".button")
const purple = document.querySelector(".color__item-purple")
const green = document.querySelector(".color__item-green")
const red = document.querySelector(".color__item-red")
const ctx = canvas.getContext("2d")



class Main {
  lastSelected = null

  setLastSelected(id){
    this.lastSelected = id
  }

  getLineDash(x1, y1, x2, y2){
    var length = Math.hypot((x2 - x1), (y2 - y1))
    var dash_length = length / 8
    var nb_of_dashes = length / dash_length
    var dash_gap = (dash_length * 0.66)
    dash_length -= dash_gap * 0.33
    return [dash_length, dash_gap]
  }
  drawLineDash(x, y, radius, borderColor){
    const getLineDash = this.getLineDash

    var points = [
      [x, y],
      [x + radius, y],
      [x + radius, y + radius],
      [x, y + radius]
    ];
    
    points.forEach(function(pt, i) {
      var next = points[(i + 1) % points.length]
      ctx.beginPath()
      ctx.moveTo(pt[0], pt[1])
      ctx.lineTo(next[0], next[1])
      ctx.setLineDash(getLineDash(pt[0], pt[1], next[0], next[1]))
      ctx.stroke()
      ctx.setLineDash([])
    })
  }
  changeColor(backgroundColor, borderColor){
    let ball;
    (this.lastSelected == 1) ? ball = ball1 : ball = ball2
    ball.setColor(backgroundColor, borderColor)
    main.drawAll()
  }
  drawAll(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
   
    if (canvas.getContext) {
        ball1.draw()
        ball2.draw()
    }
  }
}

class Ball extends Main {
  radius = 50
  selected = false
  dx = 0
  dy = 0

  constructor(id, x, y, color, borderColor) {
    super()
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.borderColor = borderColor
  }
  setColor(color, borderColor){
    this.color = color
    this.borderColor = borderColor
  }
  setSelected(isSelected){
    this.selected = isSelected
  }
  setPosition(x, y){
    this.x = x + this.dx
    this.y = y + this.dy
  }
  clear(){
    this.dx = 0
    this.dy = 0
  }
  draw() {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.radius, this.radius)
    ctx.strokeStyle = this.borderColor
    if(this.selected){
      this.drawLineDash(this.x, this.y, this.radius, this.borderColor)
    }else{
      ctx.strokeRect(this.x + 1, this.y + 1, 48, 48);
    }  
  }
  condition(e) {
    const cx = this.x + this.radius > e.clientX && this.x < e.clientX
    const cy = this.y + this.radius > e.clientY && this.y < e.clientY
    this.dx = this.x - e.clientX
    this.dy = this.y - e.clientY
    return (cx && cy) ? true : false
  }

}

class Merge extends Main {
  selected = false
  constructor(ball1, ball2){
    super()
    this.ball1 = ball1
    this.ball2 = ball2
  }
  setSelected(){
    this.selected = true
    this.draw()
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = this.ball1.color
    ctx.fillRect(this.ball1.x, this.ball1.y, this.ball1.radius, this.ball1.radius, 1)
    ctx.fillStyle = this.ball2.color
    ctx.fillRect(this.ball2.x, this.ball2.y, this.ball2.radius, this.ball2.radius, 1)

    ctx.strokeStyle = this.ball1.borderColor
    this.drawLineDash(this.ball1.x, this.ball1.y, this.ball1.radius, this.ball1.borderColor)
    ctx.strokeStyle = this.ball2.borderColor
    this.drawLineDash(this.ball2.x, this.ball2.y, this.ball2.radius, this.ball2.borderColor)
  }
}

let ball1 = new Ball(1, 100, 100, "#D1EFEC", "#34B5A9")
let ball2 = new Ball(2, 100, 300, "#E3CFF3", "#7F26C8")
let main = new Main()
let merge = null
main.drawAll()

canvas.addEventListener("mousemove", (e) => {  
  let a = ball1.x > ball2.x - ball2.radius && ball1.x < ball2.x + ball2.radius
  let b = ball1.y > ball2.y - ball2.radius && ball1.y < ball2.y + ball2.radius
  if(a && b){
    button.classList.add('button__active')
    ball1.setSelected(false)
    ball2.setSelected(false)
    ball1.clear()
    ball2.clear()
    if(!merge){
      merge = new Merge(ball1, ball2)
    }   
  }

  if(ball1.selected){
    ball1.setPosition(e.clientX, e.clientY)
    main.drawAll()
  }
  if(ball2.selected){
    ball2.setPosition(e.clientX, e.clientY)
    main.drawAll()
  }
  if(merge && merge.selected){
    let dx = ball1.x - ball2.x
    let dy = ball1.y - ball2.y
    ball1.setPosition(e.clientX, e.clientY)
    ball2.setPosition(e.clientX - dx, e.clientY - dy)
    merge.draw()
  }
})

canvas.addEventListener("mousedown", (e) => {

  if(ball1.condition(e)){
    main.setLastSelected(1)
  }else{
    main.setLastSelected(2)
  }

  if(!merge){
    if(ball1.condition(e)){
      ball1.setSelected(true)
    }
    if(ball2.condition(e)){
      ball2.setSelected(true)
    }
    main.drawAll()
  }else{
    if(ball1.condition(e) || ball2.condition(e)){
      merge.setSelected()
      merge.draw()
    }
  }
  
})

canvas.addEventListener("mouseup", (e) => {
	ball1.setSelected(false)
  ball2.setSelected(false)
  if(merge){
    merge.selected = false
  }
  main.drawAll()
})


button.addEventListener("click", (e) => {
  if(merge){
    button.classList.remove('button__active')
    merge = null
    ball1.clear()
    ball2.clear()
    ball1.setPosition(100, 100)
    ball2.setPosition(100, 300)
    main.drawAll()
  }
})

green.addEventListener("click", (e) => {
  main.changeColor("#D1EFEC", "#34B5A9")
})
purple.addEventListener("click", (e) => {
  main.changeColor("#E3CFF3", "#7F26C8")
})
red.addEventListener("click", (e) => {
  main.changeColor("#FAE6D8", "#EA8C48")
})

