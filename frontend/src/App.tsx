/** @format */

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm/RegistrationForm";
import AvatarGreeting from "./components/AvatarGreeting/AvatarGreeting";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";
import PostVideoGreeting from "./components/PostVideoGreeting/PostVideoGreeting";
import MCQFlow from "./components/MCQFlow/MCQFlow";

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<RegistrationForm />} />
				<Route path='/greeting/:sessionId' element={<AvatarGreeting />} />
				<Route path='/video/:sessionId' element={<VideoPlayer />} />
				<Route path='/post-video/:sessionId' element={<PostVideoGreeting />} />
				<Route path='/mcq/:sessionId' element={<MCQFlow />} />
			</Routes>
		</Router>
	);
};

export default App;
