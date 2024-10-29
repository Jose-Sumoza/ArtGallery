import { useCallback } from 'react';

const useScrollLock = (isModal = false) => {
	const lockScroll = useCallback(() => {
		if (isModal) return document.body.classList.add('lockedModalScroll');
		document.body.classList.add('lockedScroll');
	}, []);

	const unlockScroll = useCallback(() => {
		if (isModal) return document.body.classList.remove('lockedModalScroll');
		document.body.classList.remove('lockedScroll');
	}, []);

	return {
		lockScroll,
		unlockScroll
	};
};

export default useScrollLock;