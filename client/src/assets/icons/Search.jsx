import React from 'react';

export const Search = (props) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			role="presentation"
			viewBox="0 0 24 24"
			fill="none"
			{ ...props }
		>
			<path d="M17.5 17.5L22 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="currentColor" strokeLinejoin="round" />
		</svg>
	);
};