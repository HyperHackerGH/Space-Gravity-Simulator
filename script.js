kaboom({
    background: [0, 0, 0]
})

const gc = 0.667430
const dt = 1
var lastvel = vec2(0, 0)
var pmass = 100
var planets = []

const canvas = document.getElementById("minimap")
const ctx = canvas.getContext("2d")

function calcforce(m1, m2, r) {return gc * (m1 * m2) / (r * r)}
function calcacc(f, m) {return f / m}
function calcvel(u, a, t) {return u + a * t}
function calcpos(u, a, t) {return u * t + 0.5 * a * t * t}

function resetstarposvel() {
    star.pos = vec2(width() / 2 - 7.5, height() / 2 - 7.5)
    star.vel = vec2(0, 0)
    lastvel = vec2(0, 0)
}

function clearplanets() {
    planets.forEach(planet => destroy(planet))
    planets = []
}

function drawminimap(x, y, type) {
    x = ((x - (width() / 2 - 7.5)) / 50000) * 300 + 150
    y = ((y - (height() / 2 - 7.5)) / 50000) * 300 + 150
    
    ctx.beginPath()
    
    if (type == "star") {
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fillStyle = "#fff"
    }
    if (type == "planet") {
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fillStyle = "#0ff"
    }
    
    ctx.fill()
}

const star = add([
    pos(width() / 2 - 7.5, height() / 2 - 7.5),
    circle(15),
    area(),
    color(255, 255, 255),
    "star",
    {
        mass: 2000,
        vel: vec2(0, 0)
    }
])

var mousedown = false
var startpos = vec2(0, 0)
var endpos = vec2(0, 0)

function launchplanet(start, end) {
    const dx = start.x - end.x
    const dy = start.y - end.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 5) return

    const velx = (dx / dist) * dist * 0.1
    const vely = (dy / dist) * dist * 0.1

    planets.push(
        add([
            pos(start),
            circle(10),
            area(),
            color(0, 255, 255),
            {
                mass: pmass,
                vel: vec2(velx, vely)
            }
        ])
    )
}

onMouseDown(() => {
    if (!mousedown) {startpos = mousePos()}
    mousedown = true
})

onMouseRelease(() => {
    mousedown = false
    endpos = mousePos()
    launchplanet(startpos, endpos)
})

onUpdate(() => {
    if (parseInt(document.getElementById("starmass").value)) {star.mass = parseInt(document.getElementById("starmass").value)}
    else {star.mass = 2000}
    if (parseInt(document.getElementById("planetmass").value)) {planets.forEach(planet => {planet.mass = parseInt(document.getElementById("planetmass").value)})}
    else {planets.forEach(planet => {planet.mass = 100})}
    
    ctx.clearRect(0, 0, 300, 300)
    drawminimap(star.pos.x, star.pos.y, "star")

    if (planets.length == 0) {
        star.pos.x += lastvel.x * dt
        star.pos.y += lastvel.y * dt
    }

    planets.forEach(planet => {
        drawminimap(planet.pos.x, planet.pos.y, "planet")
        const dx = planet.pos.x - star.pos.x
        const dy = planet.pos.y - star.pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist <= 20) {
            planets.splice(planets.indexOf(planet), 1)
            destroy(planet)
            return
        }

        const force = calcforce(star.mass, planet.mass, dist)

        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        const acc1x = calcacc(fx, star.mass)
        const acc1y = calcacc(fy, star.mass)
        const acc2x = calcacc(-fx, planet.mass)
        const acc2y = calcacc(-fy, planet.mass)

        star.vel.x = calcvel(star.vel.x, acc1x, dt)
        star.vel.y = calcvel(star.vel.y, acc1y, dt)
        planet.vel.x = calcvel(planet.vel.x, acc2x, dt)
        planet.vel.y = calcvel(planet.vel.y, acc2y, dt)

        star.pos.x += calcpos(star.vel.x, acc1x, dt)
        star.pos.y += calcpos(star.vel.y, acc1y, dt)
        planet.pos.x += calcpos(planet.vel.x, acc2x, dt)
        planet.pos.y += calcpos(planet.vel.y, acc2y, dt)

        lastvel = star.vel.clone()
    })
})