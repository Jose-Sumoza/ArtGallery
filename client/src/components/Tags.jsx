import { forwardRef } from "react";

const Tags = forwardRef(({ tags, ...props }, ref) => {
	return (
		<ul { ...props } ref={ ref }>
			{
				tags.map((tag, ind) =>
					<li
						key={ ind }
						className='flex items-center justify-center px-2 py-1 rounded text-sm text-primary dark:text-mercury-100 border border-link-water-300 dark:border-bunker-800 bg-link-water-50 dark:bg-bunker-900/30 transition-[color,background-color,border-color,opacity] duration-100 gap-2 select-none hover:border-link-water-400 hover:dark:border-bunker-600 hover:bg-link-water-300 hover:dark:bg-bunker-800'
					>
						{ tag }
					</li>
				)
			}
		</ul>
	);
});

export default Tags;