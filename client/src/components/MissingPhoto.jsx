import { User } from '@icons';

const MissingPhoto = ({ className }) => {
	return (
		<div className={ `flex items-center justify-center aspect-square text-link-water-300 dark:text-bunker-500 bg-link-water-100 dark:bg-bunker-900 ${ className || '' }` }>
			<User className='!w-3/5' />
		</div>
	);
};

export default MissingPhoto;