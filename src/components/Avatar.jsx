import "./Avatar.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { createAvatarSynthesizer, createWebRTCConnection } from "./Utility";
import { avatarAppConfig } from "./config";
import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";

export const Avatar = ({ value }) => {
    const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
    const myAvatarVideoEleRef = useRef();
    const myAvatarAudioEleRef = useRef();
    const [mySpeechText, setMySpeechText] = useState(value ?? "")
    const iceUrl = avatarAppConfig.iceUrl;
    const iceUsername = avatarAppConfig.iceUsername;
    const iceCredential = avatarAppConfig.iceCredential;
    const sessionTimerRef = useRef(null);

    useEffect(() => {
        if (value) {
            speakSelectedText(value);
        }
    }, [value]);

    const handleSpeechText = useCallback((event) => {
        setMySpeechText(event.target.value);
    }, []);

    const handleOnTrack = (event) => {
        if (event.track.kind === 'video') {
            const mediaPlayer = myAvatarVideoEleRef.current;
            mediaPlayer.id = event.track.kind;
            mediaPlayer.srcObject = event.streams[0];
            mediaPlayer.autoplay = true;
            mediaPlayer.playsInline = true;
        } else {
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.srcObject = event.streams[0];
            audioPlayer.autoplay = true;
            audioPlayer.playsInline = true;
            audioPlayer.muted = true;
        }
    };

    const stopSpeaking = () => {
        if (avatarSynthesizer) {
            avatarSynthesizer.stopSpeakingAsync().then(() => {
                console.log("Stop speaking request sent.");
            }).catch(console.error);
        }
    };

    const stopSession = () => {
        try {
            if (avatarSynthesizer) {
                avatarSynthesizer.stopSpeakingAsync().then(() => {
                    console.log("Stop session request sent.");
                    avatarSynthesizer.close();
                }).catch(console.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const speakSelectedText = (text) => {
        // if (!avatarSynthesizer) {
        //     console.log("Session is not started. Starting session...");
        //     startSession(() => speakTextAfterSessionStart(text));
        // }
        if (avatarSynthesizer && text) {
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.muted = false;
            avatarSynthesizer.speakTextAsync(text).then(
                (result) => {
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        console.log("Speech synthesized.");
                    } else {
                        console.log("Unable to speak. Result ID: " + result.resultId);
                    }
                }).catch((error) => {
                    console.error(error);
                    avatarSynthesizer.close();
                });
        }
    };

    const startSession = () => {
        const peerConnection = createWebRTCConnection(iceUrl, iceUsername, iceCredential);
        peerConnection.ontrack = handleOnTrack;
        peerConnection.addTransceiver('video', { direction: 'sendrecv' });
        peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
        const synthesizer = createAvatarSynthesizer();
        setAvatarSynthesizer(synthesizer);
        synthesizer.startAvatarAsync(peerConnection).then(() => {
            console.log("Avatar started.");
        }).catch(console.error);
    };

    return (
        <div className="container myAvatarContainer">
            <div className="container myAvatarVideoRootDiv d-flex avator-area">
                <div className="myAvatarVideo">
                    <div id="myAvatarVideo" className="myVideoDiv">
                        <div className="my-avator-container">
                        <video className="myAvatarVideoElement" ref={myAvatarVideoEleRef}></video>
                        <audio ref={myAvatarAudioEleRef}></audio>
                        </div>
                    </div>
                </div>
            </div>
            <div className="controls">
                {/* Start Session Button */}
                <button onClick={startSession} className="btn btn-primary">
                    Start Session
                </button>

                {/* Stop Session Button */}
                <button onClick={stopSession} className="btn btn-danger">
                    Stop Session
                </button>

                {/* Text Input */}
                <input
                    type="text"
                    value={mySpeechText}
                    onChange={handleSpeechText}
                    placeholder="Enter text for avatar to speak"
                />

                {/* Speak Text Button */}
                <button onClick={() => speakSelectedText(mySpeechText)} className="btn btn-secondary">
                    Speak Text
                </button>

                {/* Stop Speaking Button */}
                <button onClick={stopSpeaking} className="btn btn-warning">
                    Stop Speaking
                </button>
            </div>
        </div>
    );
};
