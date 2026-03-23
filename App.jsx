// App.jsx — poori file replace karo

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '../BrainQuest/src/constants/ThemeContext';

import HomeScreen   from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import QuizScreen   from './src/screens/QuizScreen';
import BattleScreen from './src/screens/BattleScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Home"   component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Quiz"   component={QuizScreen} />
                <Stack.Screen name="Battle" component={BattleScreen} />
                  <Stack.Screen name="Result" component={ResultScreen} />
        {/* 
        
      
        */}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}