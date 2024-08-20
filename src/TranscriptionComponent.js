import React, { useState } from 'react';
import axios from 'axios';
import './TranscriptionComponent.css';
import audioIcon from './audio.png'; // Updated import path

const TranscriptionComponent = () => {
    const [files, setFiles] = useState([]);
    const [transcription, setTranscription] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Upload a file and click "Transcribe"');
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const fileInputRef = React.createRef();

    const handleFileChange = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    };

    const handleBoxClick = () => {
        fileInputRef.current.click();
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Text copied to clipboard');
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
        });
    };

    const transcribeAudio = async () => {
        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

        try {
            setLoading(true);
            setStatus('Transcribing...');

            const responses = await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('model', 'whisper-1');
                formData.append('response_format', 'json');
                formData.append('language', selectedLanguage);

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
                return { name: file.name, text: response.data.text };
            }));

            setTranscription(responses);
            setStatus('Transcription completed.');
        } catch (error) {
            console.error('Error transcribing audio:', error);
            setTranscription([{ name: 'Error', text: 'Error transcribing audio.' }]);
            setStatus('Failed to transcribe audio.');
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h1>Audio Transcription</h1>
            <div className="language-selection">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select"
                >
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    {/* Add more languages as needed */}
                </select>
                <span className="selected-language-text">
                    Selected Language: {selectedLanguage === 'en' ? 'English' :
                                       selectedLanguage === 'ta' ? 'Tamil' :
                                       selectedLanguage === 'es' ? 'Spanish' :
                                       selectedLanguage === 'fr' ? 'French' :
                                       selectedLanguage === 'de' ? 'German' : ''}
                </span>
            </div>
            <div className="file-list" onClick={handleBoxClick}>
    <div className="file-box">
        {files.length === 0 ? (
            <span>Click here to upload files</span>
        ) : (
            files.map((file, index) => (
                <div key={index} className="file-item">
                    <div className="file-icon">
                        <img src={audioIcon} alt="file-icon" />
                    </div>
                    <div className="file-name">{file.name}</div>
                    <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeFile(index); }}>✖</button>
                </div>
            ))
        )}
    </div>
</div>

            <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                ref={fileInputRef}
                className="hidden-file-input"
                multiple
            />
            <button
                onClick={transcribeAudio}
                disabled={files.length === 0}
                className="transcribe-button"
            >
                Transcribe
            </button>
            {loading && <p>{status}</p>}
            {!loading && transcription.length > 0 && (
                <div className="transcription-box">
                    <div className="transcription-content">
                        {transcription.map((item, index) => (
                            <div key={index} className="transcription-item">
                                <div>{item.name}</div>
                                <div>{item.text}</div>
                                <button 
                                    className="copy-button" 
                                    onClick={() => copyToClipboard(item.text)}
                                >
                                    Copy Text
                                </button>
                                <span className="cancel-icon" onClick={() => setTranscription(transcription.filter((_, i) => i !== index))}>✖</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptionComponent;
