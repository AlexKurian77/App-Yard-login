import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const GradientBackground = () => (
  <Svg height="100%" width="100%" style={{ position: 'absolute', zIndex: -1 }}>
    <Defs>
      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="12.08%" stopColor="#06102D" />
        <Stop offset="55.59%" stopColor="#100D79" />
        <Stop offset="69.27%" stopColor="#1613AC" />
        <Stop offset="99.98%" stopColor="#9521BF" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
  </Svg>
);

export default GradientBackground;