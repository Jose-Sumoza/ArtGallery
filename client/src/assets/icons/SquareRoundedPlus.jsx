export const SquareRoundedPlus = ({ ...props }) => {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" { ...props }>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
			<path d="M15 12h-6" />
			<path d="M12 9v6" />
		</svg>
	);
};