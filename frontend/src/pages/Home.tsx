import React from 'react';
import RegistrationForm from '../components/RegistrationForm/RegistrationForm';
import AvatarGreeting from '../components/AvatarGreeting/AvatarGreeting';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import MCQFlow from '../components/MCQFlow/MCQFlow';

const Home: React.FC = () => {
    return (
        <div>
            <AvatarGreeting />
            <RegistrationForm />
            <VideoPlayer />
            <MCQFlow />
        </div>
    );
};

export default Home;