import React, { useState } from 'react';
import axios from 'axios';
import './TranscriptionComponent.css';

const TranscriptionComponent = () => {
    const [file, setFile] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Upload a file and click "Transcribe"');
    const [audioUrl, setAudioUrl] = useState(null);
    const [fileName, setFileName] = useState('');

    const fileInputRef = React.createRef();

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setAudioUrl(URL.createObjectURL(uploadedFile));
        setFileName(uploadedFile.name);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const transcribeAudio = async () => {
        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');

        try {
            setLoading(true);
            setStatus('Transcribing...');
            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setTranscription(response.data.text);
            setStatus('Transcription completed.');
        } catch (error) {
            console.error('Error transcribing audio:', error);
            setTranscription('Error transcribing audio.');
            setStatus('Failed to transcribe audio.');
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h1>SPI EDGE Audio Transcription</h1>  {/* Title here */}
            <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                ref={fileInputRef}
                className="hidden-file-input"
            />
            <button onClick={handleUploadClick} className="upload-button">Upload File</button>
            {fileName && <p>Selected file: {fileName}</p>}
            <button
                onClick={transcribeAudio}
                disabled={!file}
                className="transcribe-button"
            >
                Transcribe
            </button>
            {audioUrl && <audio controls src={audioUrl}></audio>}
            {loading && <p>{status}</p>}
            {!loading && <p>{transcription}</p>}
        </div>
    );
};

export default TranscriptionComponent;
