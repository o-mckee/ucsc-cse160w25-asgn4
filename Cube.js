class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        //drawTriangle3DUV([0,0,0, 1,1,0,  1,0,0], [0,0,  1,1,  1,0]);
        //drawTriangle3DUV([0,0,0, 0,1,0,  1,1,0], [0,0,  0,1, 1,1]);


        drawTriangle3DUVNormal(
            [0,0,0, 1,1,0, 1,0,0],
            [0,0,  1,1,  1,0],
            [0,0,-1,  0,0,-1,  0,0,-1]
        );

        drawTriangle3DUVNormal(
            [0,0,0, 0,1,0, 1,1,0],
            [0,0,  0,1,  1,1],
            [0,0,-1,  0,0,-1,  0,0,-1]
        );


        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Top of cube
        //drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
        //drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
        //drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [1,0,  0,0,  0,1]);
        //drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [1,0,  0,1,  1,1]);

        drawTriangle3DUVNormal(
            [0,1,0,  0,1,1,  1,1,1],
            [1,0,  0,0,  0,1],
            [0,1,0,  0,1,0,  0,1,0]
        );
        drawTriangle3DUVNormal(
            [0,1,0,  1,1,1,  1,1,0],
            [1,0,  0,1,  1,1],
            [0,1,0,  0,1,0,  0,1,0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Right side of cube
        //drawTriangle3DUV([1,0,1,  1,1,0,  1,0,0], [1,0,  0,1,  0,0]);
        //drawTriangle3DUV([1,1,1,  1,1,0,  1,0,1], [1,1,  0,1,  1,0]);

        drawTriangle3DUVNormal(
            [1,0,1,  1,1,0,  1,0,0],
            [1,0,  0,1,  0,0],
            [1,0,0,  1,0,0,  1,0,0]
        );
        drawTriangle3DUVNormal(
            [1,1,1,  1,1,0,  1,0,1],
            [1,1,  0,1,  1,0],
            [1,0,0,  1,0,0,  1,0,0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);

        // Left side of cube
        //drawTriangle3DUV([0,1,0,  0,0,0,  0,0,1], [0,1,  0,0,  1,0]);
        //drawTriangle3DUV([0,1,0,  0,1,1,  0,0,1], [0,1,  1,1,  1,0]);

        drawTriangle3DUVNormal(
            [0,1,0,  0,0,0,  0,0,1],
            [0,1,  0,0,  1,0],
            [-1,0,0,  -1,0,0,  -1,0,0]
        );
        drawTriangle3DUVNormal(
            [0,1,0,  0,1,1,  0,0,1],
            [0,1,  1,1,  1,0],
            [-1,0,0,  -1,0,0,  -1,0,0]
        );

        // Back of cube
        //drawTriangle3DUV([0,1,1,  0,0,1,  1,0,1], [1,1,  1,0,  0,0]);
        //drawTriangle3DUV([0,1,1,  1,1,1,  1,0,1], [1,1,  0,1,  0,0]);

        drawTriangle3DUVNormal(
            [0,1,1,  0,0,1,  1,0,1],
            [1,1,  1,0,  0,0],
            [0,0,1,  0,0,1,  0,0,1]
        );
        drawTriangle3DUVNormal(
            [0,1,1,  1,1,1,  1,0,1],
            [1,1,  0,1,  0,0],
            [0,0,1,  0,0,1,  0,0,1]
        );

        //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Bottom of cube
        //drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
        //drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);

        //drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [1,1,  1,0,  0,0]);
        //drawTriangle3DUV([0,0,0,  0,0,1,  1,0,1], [1,1,  0,1,  0,0]);

        drawTriangle3DUVNormal(
            [0,0,0,  1,0,0,  1,0,1],
            [1,1,  1,0,  0,0],
            [0,-1,0,  0,-1,0,  0,-1,0]
        );
        drawTriangle3DUVNormal(
            [0,0,0,  0,0,1,  1,0,1],
            [1,1,  0,1,  0,0],
            [0,-1,0,  0,-1,0,  0,-1,0]
        );
    }


    renderfast() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        var allverts = [];
        var allUVs = [];
        var allNormals = [];

        // Front of cube
        allverts = allverts.concat([0,0,0, 1,1,0,  1,0,0]); 
        allverts = allverts.concat([0,0,0, 0,1,0,  1,1,0]); 
        allUVs = allUVs.concat([0,0,  1,1,  1,0]);
        allUVs = allUVs.concat([0,0,  0,1, 1,1]);
        allNormals = allNormals.concat([0,0,-1,  0,0,-1,  0,0,-1]);
        allNormals = allNormals.concat([0,0,-1,  0,0,-1,  0,0,-1]);


        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Top of cube
        allverts = allverts.concat([0,1,0,  0,1,1,  1,1,1]); 
        allverts = allverts.concat([0,1,0,  1,1,1,  1,1,0]);
        allUVs = allUVs.concat([1,0,  0,0,  0,1]);
        allUVs = allUVs.concat([1,0,  0,1,  1,1]);
        allNormals = allNormals.concat([0,1,0,  0,1,0,  0,1,0]);
        allNormals = allNormals.concat([0,1,0,  0,1,0,  0,1,0]);

        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Right side of cube
        allverts = allverts.concat([1,0,1,  1,1,0,  1,0,0]);
        allverts = allverts.concat([1,1,1,  1,1,0,  1,0,1]);
        allUVs = allUVs.concat([1,0,  0,1,  0,0]);
        allUVs = allUVs.concat([1,1,  0,1,  1,0]);
        allNormals = allNormals.concat([1,0,0,  1,0,0,  1,0,0]);
        allNormals = allNormals.concat([1,0,0,  1,0,0,  1,0,0]);

        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);

        // Left side of cube
        allverts = allverts.concat([0,1,0,  0,0,0,  0,0,1]);
        allverts = allverts.concat([0,1,0,  0,1,1,  0,0,1]);
        allUVs = allUVs.concat([0,1,  0,0,  1,0]);
        allUVs = allUVs.concat([0,1,  1,1,  1,0]);
        allNormals = allNormals.concat([-1,0,0,  -1,0,0,  -1,0,0]);
        allNormals = allNormals.concat([-1,0,0,  -1,0,0,  -1,0,0]);

        // Back of cube
        allverts = allverts.concat([0,1,1,  0,0,1,  1,0,1]);
        allverts = allverts.concat([0,1,1,  1,1,1,  1,0,1]);
        allUVs = allUVs.concat([1,1,  1,0,  0,0]);
        allUVs = allUVs.concat([1,1,  0,1,  0,0]);
        allNormals = allNormals.concat([0,0,1,  0,0,1,  0,0,1]);
        allNormals = allNormals.concat([0,0,1,  0,0,1,  0,0,1]);

        //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Bottom of cube
        allverts = allverts.concat([0,0,0,  1,0,0,  1,0,1]);
        allverts = allverts.concat([0,0,0,  0,0,1,  1,0,1]);
        allUVs = allUVs.concat([1,1,  1,0,  0,0]);
        allUVs = allUVs.concat([1,1,  0,1,  0,0]);
        allNormals = allNormals.concat([0,-1,0,  0,-1,0,  0,-1,0]);
        allNormals = allNormals.concat([0,-1,0,  0,-1,0,  0,-1,0]);



        drawTriangle3DUVNormal(allverts, allUVs, allNormals);
    }
}