const vertices = [
    0.0,0.0,0.0 , 1.0,1.0,0.0 , 1.0,0.0,0.0,
    0.0,0.0,0.0 , 0.0,1.0,0.0 , 1.0,1.0,0.0,
    
    0.0,0.0,-1.0 , 1.0,1.0,-1.0 , 1.0,0.0,-1.0,
    0.0,0.0,-1.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0,
    0.0,1.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0,
    0.0,1.0,0.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0,

    0.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,0.0, 0.0,
    0.0,0.0,0.0 , 0.0,0.0,-1.0 , 1.0,0.0,-1.0,

    0.0,0.0,0.0 , 0.0,1.0,-1.0 , 0.0,1.0, 0.0,
    0.0,0.0,0.0 , 0.0,0.0,-1.0 , 0.0,1.0,-1.0,

    1.0,0.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0,
    1.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,1.0,-1.0
];

class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    render(){
        const rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 324);
    }

}