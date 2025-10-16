import React from 'react';
import AvatarGreeting from '../components/AvatarGreeting/AvatarGreeting';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import MCQFlow from '../components/MCQFlow/MCQFlow';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <h1>Welcome to the AI Training Platform</h1>
            <AvatarGreeting />
            <VideoPlayer />
            <MCQFlow />
        </div>
    );
};

export default Dashboard;