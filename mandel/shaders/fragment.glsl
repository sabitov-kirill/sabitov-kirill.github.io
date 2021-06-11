precision highp float;

uniform float zoom;
uniform vec2 resolution;
uniform vec2 offset;
uniform int iterations;

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

  gl_FragColor = vec4(0.0,0.0,0.0,0.0);

  float scale = GetMandelbrot(position, zoom, offset);
  if (scale == 0.0)
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
  else
    gl_FragColor = vec4( 0.6, 0.8, 1.0, 0.0 ) * scale + vec4(0.0, 0.2, 0.4, 1.0);
}