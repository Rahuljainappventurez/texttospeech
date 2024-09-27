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



// import "./Avatar.css";
// import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
// import { createAvatarSynthesizer, createWebRTCConnection } from "./Utility";
// import { avatarAppConfig } from "./config";
// import { useCallback, useEffect, useState } from "react";
// import { useRef } from "react";

// export const Avatar = ({ value }) => {
//     const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
//     const myAvatarVideoEleRef = useRef();
//     const myAvatarAudioEleRef = useRef();
//     const [mySpeechText, setMySpeechText] = useState(value ?? "")
//     var iceUrl = avatarAppConfig.iceUrl
//     var iceUsername = avatarAppConfig.iceUsername
//     var iceCredential = avatarAppConfig.iceCredential
//     useEffect(() => {
//         if (value) {
//             speakSelectedText(value)
//         }
//     }, [])
//     useEffect(() => {
//         if (value) {
//             speakSelectedText(value)
//         }
//     }, [value])
//     const handleSpeechText = useCallback((event) => {
//         setMySpeechText(event.target.value);
//     }, []);
//     useEffect(() => {
//         setMySpeechText(value);
//     }, [value]);
//     const handleOnTrack = (event) => {
//         console.log("#### Printing handle onTrack ", event);
//         // Update UI elements
//         console.log("Printing event.track.kind ", event.track.kind);
//         if (event.track.kind === 'video') {
//             const mediaPlayer = myAvatarVideoEleRef.current;
//             mediaPlayer.id = event.track.kind;
//             mediaPlayer.srcObject = event.streams[0];
//             mediaPlayer.autoplay = true;
//             mediaPlayer.playsInline = true;
//             mediaPlayer.setAttribute('webkit-playsinline', 'true');
//             mediaPlayer.setAttribute('playsinline', 'true');
//             mediaPlayer.addEventListener('play', () => {
//                 window.requestAnimationFrame(() => { });
//             });
//         } else {
//             // Mute the audio player to make sure it can auto play, will unmute it when speaking
//             // Refer to https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
//             //const mediaPlayer = myAvatarVideoEleRef.current;
//             const audioPlayer = myAvatarAudioEleRef.current;
//             audioPlayer.srcObject = event.streams[0];
//             audioPlayer.autoplay = true;
//             audioPlayer.playsInline = true;
//             audioPlayer.muted = true;
//         }
//     };
//     const stopSpeaking = () => {
//         avatarSynthesizer.stopSpeakingAsync().then(() => {
//             console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
//         }).catch();
//     }
//     const stopSession = () => {
//         try {
//             //Stop speaking
//             avatarSynthesizer.stopSpeakingAsync().then(() => {
//                 console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
//                 // Close the synthesizer
//                 avatarSynthesizer.close();
//             }).catch();
//         } catch (e) {
//         }
//     }

//     const speakSelectedText = (text) => {
//         if (avatarSynthesizer && text) {
//             //Start speaking the text
//             text = String(text);
//             const audioPlayer = myAvatarAudioEleRef.current;
//             console.log("Audio muted status ", audioPlayer.muted);
//             audioPlayer.muted = false;
//             if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onSpeechStart) {
//                 window.webkit.messageHandlers.onSpeechStart.postMessage(text);
//             }
//             avatarSynthesizer.speakTextAsync(text).then(
//                 (result) => {
//                     if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
//                         console.log("Speech and avatar synthesized to video stream.")
//                         if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onSpeechComplete) {
//                             window.webkit.messageHandlers.onSpeechComplete.postMessage(text);
//                         }

//                     } else {
//                         console.log("Unable to speak. Result ID: " + result.resultId)
//                         if (result.reason === SpeechSDK.ResultReason.Canceled) {
//                             let cancellationDetails = SpeechSDK.CancellationDetails.fromResult(result)
//                             console.log(cancellationDetails.reason)
//                             if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
//                                 console.log(cancellationDetails.errorDetails)
//                             }
//                         }
//                     }
//                 }).catch((error) => {
//                     console.log(error)
//                     avatarSynthesizer.close()
//                 });
//         }
//     }
//     const startSession = () => {
//         let peerConnection = createWebRTCConnection(iceUrl, iceUsername, iceCredential);
//         console.log("Peer connection ", peerConnection);
//         peerConnection.ontrack = handleOnTrack;
//         peerConnection.addTransceiver('video', { direction: 'sendrecv' })
//         peerConnection.addTransceiver('audio', { direction: 'sendrecv' })
//         let avatarSynthesizer = createAvatarSynthesizer();
//         setAvatarSynthesizer(avatarSynthesizer);
//         peerConnection.oniceconnectionstatechange = e => {
//             console.log("WebRTC status: " + peerConnection.iceConnectionState)
//             if (peerConnection.iceConnectionState === 'connected') {
//                 console.log("Connected to Azure Avatar service");
//             }
//             if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
//                 console.log("Azure Avatar service Disconnected");
//             }
//         }
//         avatarSynthesizer.startAvatarAsync(peerConnection).then((r) => {
//             console.log("[" + (new Date()).toISOString() + "] Avatar started.")
//         }).catch(
//             (error) => {
//                 console.log("[" + (new Date()).toISOString() + "] Avatar failed to start. Error: " + error)
//             }
//         );
//     }

//     useEffect(() => {
//         startSession();
//     }, []);

//     window.speakText = function(text) {
//         speakSelectedText(text);
//     };

//     window.closeAvatarSession = function() {
//         stopSession();
//     };

//     window.restoreAvatarSession = function(text) {
//         startSession();
//     };

//     return (
//         <div className="container myAvatarContainer">
//             <div className="container myAvatarVideoRootDiv d-flex ">
//                 <div className="myAvatarVideo">
//                     <div id="myAvatarVideo" className="myVideoDiv">
//                         <video className="myAvatarVideoElement" ref={myAvatarVideoEleRef}>
//                         </video>
//                         <audio ref={myAvatarAudioEleRef}>
//                         </audio>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }