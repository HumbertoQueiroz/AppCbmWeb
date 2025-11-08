import React from 'react';
import { View, StyleSheet, } from 'react-native';

const Span = ({ onSelectScreen }) => {
  return (
    <View style={styles.container}>
      <View style={styles.span}/>
      <View style={styles.span}/>
      <View style={styles.span}/>      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap:8,
    width: '100%',
    justifyContent: 'center',
    margin: 8,
    marginBottom:12,
    
  },
  span: {
    height: 12,
    width: 12,
    borderRadius: 12,
    backgroundColor: '#e2e1e1ff',
  },
});

export default Span;

