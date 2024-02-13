import {AddVectors, NormalizeVector, MultiplyVector, VectorMagnitude} from './vector_operations.js';
const mouse_pos = {x: 0, y: 0};
const movable_pos = {x: 0, y: 0};
const previous_mouse = {x: 0, y: 0};
let current_scale = 1;
let current_angle = 0;
const SPEED = 0.2;
const SCALE_SPEED = 0.1;
const OFFSET = 10;

const movable = document.getElementsByClassName('movable')[0];

const boid_container = document.getElementsByClassName('boid-container')[0];
const boids = [];
const boid_smoothing = 0.05;
const boid_speed = 7;
const separation_radius = 30;
const alignment_radius = 50;
const cohesion_radius = 50;
const avoidance_radius = 150;
const separation_strenght = 0.75;
const alignment_strenght = 0.5;
const cohesion_strenght = 0.5;
const avoidance_strength = 1;
const random_strength = 0.05;


const warp = false;

const spawn_boids = (n) => {   
    for(let i = 0; i < n; i++){
        let boid_markup = `<circle class="boid-${i}" r="8" />`;
        boid_container.innerHTML += boid_markup;

        let boid = document.getElementsByClassName(`boid-${i}`)[0];
        //boid.style.fill = 'none';
        boid.style.stroke = 'white';
        boid.style.transform = `translate(${(Math.random() * (window.innerWidth - 100)) + 50}px, ${(Math.random() * (window.innerHeight - 100)) + 50}px) scale(0.5, 1)`;
        boid_container.appendChild(boid);
        let boid_list_item = {  
                            position: {x: (Math.random() * (window.innerWidth - 100)) + 50, y: (Math.random() * (window.innerHeight - 100)) + 50},
                            current_velocity: {x: (Math.random() * 3) - 1.5, y: (Math.random() * 3) - 1.5},
                            angle: 0
                        };
        boid.style.transform = `translate(${boid_list_item.position.x}px, ${boid_list_item.position.y}px) rotate(${boid_list_item.angle}deg) scale(0.5, 1) `;    
        boids.push(boid_list_item);
    }
};

const boid_calc = (index) => {
    let boid = boids[index];
    let separation = {x: 0, y: 0};
    let alignment = {x: 0, y: 0};
    let cohesion = {x: 0, y: 0};
    let center_of_mass = {x: 0, y: 0};
    let avoidance = {x: 0, y: 0};
    let count = 0;
    for(let i = 0; i < boids.length; i++){
        let other_boid = boids[i];
        let distance = VectorMagnitude({x: other_boid.position.x - boid.position.x, y: other_boid.position.y - boid.position.y});
        if(index !== 0){
            if(distance < separation_radius){

                separation.x -= (other_boid.position.x - boid.position.x) * (10 - (10 * (distance / separation_radius)));
                separation.y -= (other_boid.position.y - boid.position.y) * (10 - (10 * (distance / separation_radius)));
            }
            if(distance < cohesion_radius){

                center_of_mass.x += other_boid.position.x;
                center_of_mass.y += other_boid.position.y;
                count++;
            }
        }
     
        if(distance < alignment_radius){
            alignment.x += other_boid.current_velocity.x;
            alignment.y += other_boid.current_velocity.y;
        }
        distance = VectorMagnitude({x: movable_pos.x - boid.position.x, y: movable_pos.y - boid.position.y});
        if(distance < avoidance_radius){
            avoidance.x -= (movable_pos.x - boid.position.x) * (10 - (10 * (distance / avoidance_radius)));
            avoidance.y -= (movable_pos.y - boid.position.y) * (10 - (10 * (distance / avoidance_radius)));
        }
    }
    if(count > 0){
        center_of_mass.x /= count;
        center_of_mass.y /= count;
        cohesion.x = center_of_mass.x - boid.position.x;
        cohesion.y = center_of_mass.y - boid.position.y;
    }
    let random_movement = {x: (Math.random() * 2) - 1, y: (Math.random() * 2) - 1};
    random_movement = NormalizeVector(random_movement);
    random_movement = MultiplyVector(random_movement, random_strength);

    separation = NormalizeVector(separation);
    alignment = NormalizeVector(alignment);
    cohesion = NormalizeVector(cohesion);
    avoidance = NormalizeVector(avoidance);
    
    separation = MultiplyVector(separation, separation_strenght);
    alignment = MultiplyVector(alignment, alignment_strenght);
    cohesion = MultiplyVector(cohesion, cohesion_strenght);
    avoidance = MultiplyVector(avoidance, avoidance_strength);
    
    
    let combined_velocity = AddVectors(separation, alignment);
    combined_velocity = AddVectors(combined_velocity, cohesion);
    combined_velocity = AddVectors(combined_velocity, random_movement);
    combined_velocity = AddVectors(combined_velocity, avoidance);
    combined_velocity = NormalizeVector(combined_velocity);
    return combined_velocity;
};

const boid_update = () =>{
    let next_velocities = [];
    for(let i = 0; i < boids.length; i++){
        let combined_velocity = boid_calc(i);
        next_velocities.push(combined_velocity);
    }
    for(let i = 0; i < boids.length; i++){
        let combined_velocity = next_velocities[i];
        boid_move(i, combined_velocity);
    }
};

const boid_move = (index, desired_velocity) => {
    let boid = boids[index];

    boid.current_velocity.x += (desired_velocity.x - boid.current_velocity.x) * boid_smoothing;
    boid.current_velocity.y += (desired_velocity.y - boid.current_velocity.y) * boid_smoothing;
    boid.angle = Math.atan2(boid.current_velocity.y, boid.current_velocity.x) * 180 / Math.PI;
    boid.angle = boid.angle-90;
    boid.position.x += boid.current_velocity.x * boid_speed;
    boid.position.y += boid.current_velocity.y * boid_speed;


    if(boid.position.x > window.innerWidth){
        if(warp){
            boid.position.x = 0;
        }
        else{
            boid.position.x = window.innerWidth;
            boid.current_velocity.x = -boid.current_velocity.x;
        }
    }
    else if(boid.position.x < 0){
        if(warp){
            boid.position.x = window.innerWidth;
        }
        else{
            boid.position.x = 0;
            boid.current_velocity.x = -boid.current_velocity.x;
        }
    }
    if(boid.position.y > window.innerHeight - 20){
        if(warp){
            boid.position.y = 0;
        }
        else{
            boid.position.y = window.innerHeight - 20;
            boid.current_velocity.y = -boid.current_velocity.y;
        }
    }
    else if(boid.position.y < 0){
        if(warp){
            boid.position.y = window.innerHeight - 20;
        }
        else{
            boid.position.y = 0;
            boid.current_velocity.y = -boid.current_velocity.y;
        }
    }

    document.getElementsByClassName(`boid-${index}`)[0].style.transform = `translate(${boid.position.x}px, ${boid.position.y}px) rotate(${boid.angle}deg) scale(0.5, 1) `;
};

document.onmousemove = (e) => {
    mouse_pos.x = e.clientX - OFFSET;
    mouse_pos.y = e.clientY - OFFSET;
};
const clamp = (value, min, max) => {
    if(value > max){
        value = max;
    }
    else if(value < min){
        value = min;
    }
    return value;
};
const cursor_movement = () => { 
    movable_pos.x += (mouse_pos.x - movable_pos.x) * SPEED;
    movable_pos.y += (mouse_pos.y - movable_pos.y) * SPEED;

    const delta_x = mouse_pos.x - previous_mouse.x;
    const delta_y = mouse_pos.y - previous_mouse.y;
    previous_mouse.x = mouse_pos.x;
    previous_mouse.y = mouse_pos.y;

    let magnitude = clamp(Math.sqrt((delta_x**2) + (delta_y**2)), 0, 50);
    let scale_factor = (magnitude / 50) * 0.6;

    let angle = Math.atan2(delta_y, delta_x) * 180 / Math.PI;
    if(magnitude > 5){
        current_angle = angle;
    }

    current_scale += (scale_factor - current_scale) * SCALE_SPEED;

    movable.style.transform = `translate(${movable_pos.x}px, ${movable_pos.y}px) rotate(${current_angle}deg) scale(${1 + current_scale},${1 - current_scale})`;
};
const setup = () => {
    spawn_boids(200);
    update();
};
const update = () => {
    cursor_movement();
    boid_update();
    window.requestAnimationFrame(update);
};

setup();