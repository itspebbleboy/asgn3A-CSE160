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

const uvs = [
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
    0,0, 1,1, 1,0 ,  0,0, 0,1, 1,1,
];

class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [0,0,0,0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }

    render(){
        const rgba = this.color;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        this.vertexBuffer = gl.createBuffer();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES,0, 36);
    }   

}