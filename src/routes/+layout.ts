import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    let now = new Date();
	return {
		blue: false, //now.getMonth() == 4 && now.getDay() == 1,
	};
};
