import { IComboBoxOption } from "@fluentui/react";
import { Task } from "./Task";

export type TaskListState = {
	assignedTasks: Task[];
	displayedTasks: Task[];
	selectedOptions: IComboBoxOption[];
};
