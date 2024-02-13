const AddVectors = (a, b) => {
    return {x: a.x + b.x, y: a.y + b.y};
}
const NormalizeVector = (a) => {
    let magnitude = VectorMagnitude(a);
    if(magnitude <= 0){
        return {x: 0, y: 0};
    }
    return {x: a.x / magnitude, y: a.y / magnitude};
}
const MultiplyVector = (a, multiplier) => {
    return {x: a.x * multiplier, y: a.y * multiplier};
}
const VectorMagnitude = (a) => {
    let v = Math.sqrt((Math.abs(a.x)**2) + (Math.abs(a.y)**2));
    if(v.x != v.x || v.y != v.y) {
        return 0;
    }
    else 
    {
        return v;
    }
}

export {AddVectors, NormalizeVector, MultiplyVector, VectorMagnitude};