import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

export default function App() {
  const [ imgSrc, setImgSrc ] = useState(false);
  const [ recording, setRecording ] = useState(false);
  const [ savedRecordings, setSavedRecordings ] = useState([])
  const [ sound, setSound ] = useState(false);

  let openImagePickerAsync = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.granted === false) {
      alert('Please give the app permission to access photos on your device.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    setImgSrc(result.uri);
  }

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (error) {
      console.error(error)
    }
  };


  const stopRecording = async () => {
    setRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording resource stored at: ', uri);
    setSavedRecordings([...savedRecordings, uri ]);
  };

  const playSound = async (recording) => {
    console.log(recording)
    const { sound } = await Audio.Sound.createAsync({ uri: recording, shouldPlay: true });
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined 
  }, [sound])

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>

      {/* IMAGE */}
      { imgSrc && <Image source={{ uri: imgSrc, width: 100, height: 100 }}/>}
      <TouchableOpacity
        onPress={openImagePickerAsync}
        style={{ backgroundColor: 'orangered' }}
      >
        <Text style={{ fontSize: 20 }}>Pick a photo</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />

      {/* AUDIO */}
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording }
      >
      </Button>

      { savedRecordings.length > 0 && savedRecordings.map((recording, index) => {
          return (
            <Button 
              key={index}
              title={`Recording ${index+1}`}
              onPress={() => playSound(recording)}
            >
            </Button>
          )
        })
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
