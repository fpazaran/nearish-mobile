import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Background } from './Background';
import { Typography } from './Typography';
import { colors } from '../../constants/theme';

interface Props {
  message?: string;
}

export function LoadingScreen({ message }: Props) {
  return (
    <Background>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? (
          <Typography variant="bodySmall" style={styles.message}>
            {message}
          </Typography>
        ) : null}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    marginTop: 4,
  },
});
