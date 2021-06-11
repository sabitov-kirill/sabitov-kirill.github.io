precision highp float;

uniform float zoom;
uniform vec2 resolution;
uniform vec2 offset;
uniform int iterations;
uniform vec3 ins_col;
uniform vec3 out_col;
uniform vec3 back_col;
uniform float col_blend;

float GetMandelbrot(vec2 pos, float zoom, vec2 offset)
{
  vec2 C = offset + pos / zoom;                
  vec2 Zn=vec2(0.0, 0.0);

  for( int i = 0; i < 1000; ++i)
  {
    if (i >= iterations) break;

    float x2 = Zn.x * Zn.x;
    float y2 = Zn.y * Zn.y;
    if (x2 + y2 > 4.0)
    { 
      return float(i + 1) / float(iterations + 1);
    } 
    
    Zn.y = (Zn.y * Zn.x * 2.0) + C.y; 
    Zn.x = (x2 - y2) + C.x; 
  }
  return 0.0;
}
    
void main( void ) 
{
  float aspectRatio = resolution.x / resolution.y;
  vec2 position = - 1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
  position.x *= aspectRatio;

  gl_FragColor = vec4(0.0);

  float scale = GetMandelbrot(position, zoom, offset);
  if (scale == 0.0)
    gl_FragColor = vec4(ins_col, 1.0);
  else
    gl_FragColor = vec4(out_col, 0.0) * scale * col_blend + vec4(back_col, 1.0);
}