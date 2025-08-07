import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

const useBlinkingAnimation = (duration = 5000) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    fadeAnimation.start();

    const hideTimeout = setTimeout(() => {
      fadeAnimation.stop();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 5000);

    return () => {
      fadeAnimation.stop();
      clearTimeout(hideTimeout);
    };
  }, [opacity, duration]);

  return opacity;
};

export default useBlinkingAnimation;
