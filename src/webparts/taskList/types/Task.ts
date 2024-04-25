export type Task = {
	id: string;
	title: string;
	assignedTo?: string[];
	dueDateTime?: string;
	description?: string;
	bucketId: string;
};
