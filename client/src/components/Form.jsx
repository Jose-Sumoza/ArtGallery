import React from 'react';

const Form = ({ onSubmit, children, ...props }) => {
	return (
		<form onSubmit={ onSubmit } { ...props }>
			{ children }
		</form>
	);
};

const Footer = ({ children, ...props }) => {
	return (
		<div { ...props }>
			{ children }
		</div>
	);
};

const Buttons = ({ children, ...props }) => {
	return (
		<div { ...props }>
			{ children }
		</div>
	);
};

const Message = ({ children, ...props }) => {
	return (
		<span { ...props }>{ children }</span>
	);
};

Footer.Buttons = Buttons;
Footer.Message = Message;
Form.Footer = Footer;

export default Form;