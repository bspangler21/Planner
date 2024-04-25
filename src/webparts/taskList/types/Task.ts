export type Task = {
	id: string;
	title: string;
	assignedTo?: string[];
	dueDateTime?: Date;
	description?: string;
	bucketId: string;
};
