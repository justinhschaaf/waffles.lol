import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    let now = new Date();
	return {
		af: now.getMonth() == 4 && now.getDay() == 1,
	};
};
