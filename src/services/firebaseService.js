// src/services/firebaseService.js

import database from '@react-native-firebase/database';

export const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (roomCode, topic, questions, playerName) => {
  await database()
    .ref(`/battles/${roomCode}`)
    .set({
      topic,
      questions,
      status   : 'waiting',
      createdAt: Date.now(),
      playerA  : { name: playerName, score: 0, answers: {}, done: false },
      playerB  : null,
    });
    
};

export const joinRoom = async (roomCode, playerName) => {
  const snap = await database().ref(`/battles/${roomCode}`).once('value');
  if (!snap.exists()) throw new Error('Room not found');
  if (snap.val().playerB) throw new Error('Room is full');
  await database().ref(`/battles/${roomCode}`).update({
    playerB: { name: playerName, score: 0, answers: {}, done: false },
    status : 'active',
  });
  return snap.val();
};

export const submitAnswer = async (roomCode, role, qIndex, answer, points) => {
  const ref = database().ref(`/battles/${roomCode}/${role}`);
  const snap = await ref.once('value');
  const current = snap.val();
  await ref.update({
    [`answers/${qIndex}`]: answer,
    score: (current.score || 0) + points,
  });
};

export const markDone = async (roomCode, role) => {
  await database().ref(`/battles/${roomCode}/${role}`).update({ done: true });
};

export const listenToRoom = (roomCode, callback) => {
  const ref = database().ref(`/battles/${roomCode}`);
  ref.on('value', snap => callback(snap.val()));
  return () => ref.off('value');
};

export const deleteRoom = async (roomCode) => {
  await database().ref(`/battles/${roomCode}`).remove();
};