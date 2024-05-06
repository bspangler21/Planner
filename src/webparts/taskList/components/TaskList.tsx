/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import styles from "./TaskList.module.scss";
import type { TaskListProps } from "../types/TaskListProps";
import type { TaskListState } from "../types/TaskListState";
import { escape } from "@microsoft/sp-lodash-subset";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import {
	ComboBox,
	DefaultButton,
	DetailsList,
	IColumn,
	IComboBox,
	IComboBoxOption,
	mergeStyleSets,
} from "@fluentui/react";
import { Task } from "../types/Task";
import { buckets, planId, options } from "../../../Hidden";
import { getTaskDetails } from "../services/TaskDetailService";

const defaultKey: string = buckets[4].key.toString();

const classNames = mergeStyleSets({
	largeHeader: {
		width: "500px",
		fontSize: "20px",
		fontWeight: "bold",
	},
	regularHeader: {
		width: "300px",
		fontSize: "20px",
		fontWeight: "bold",
	},
	comboBox: {
		width: "300px",
		padding: "10px",
	},
	filters: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		// justifyContent: "space-between",
	},
});

const taskColumns: IColumn[] = [
	{
		key: "title",
		name: "Title",
		fieldName: "title",
		minWidth: 100,
		maxWidth: 500,
		isResizable: true,
	},
	{
		key: "dueDateTime",
		name: "Due Date",
		fieldName: "dueDateTime",
		minWidth: 100,
		maxWidth: 100,
		isResizable: true,
	},
	{
		key: "assignedTo",
		name: "Assigned To",
		fieldName: "assignedTo",
		minWidth: 100,
		maxWidth: 500,
		isResizable: true,
	},
];

export default class TaskList extends React.Component<
	TaskListProps,
	TaskListState
> {
	constructor(props: TaskListProps, state: TaskListState) {
		super(props);
		this.state = {
			assignedTasks: [],
			displayedTasks: [],
			selectedOptions: [],
		};
	}
	public render(): React.ReactElement<TaskListProps> {
		const {
			description,
			isDarkTheme,
			environmentMessage,
			hasTeamsContext,
			userDisplayName,
		} = this.props;

		return (
			<section
				className={`${styles.taskList} ${
					hasTeamsContext ? styles.teams : ""
				}`}
			>
				<div className={classNames.filters}>
					<ComboBox
						label="Filter by Bucket:"
						options={buckets}
						// defaultSelectedKey={defaultKey}
						// multiSelect
						onItemClick={this._filterByBucket}
						className={classNames.comboBox}
					/>
					<ComboBox
						label="Filter by Assigned To:"
						options={options}
						// defaultSelectedKey={defaultKey}
						// multiSelect
						onItemClick={this._filterByAssignedTo}
						className={classNames.comboBox}
					/>
					<DefaultButton
						onClick={() => {
							this.setState({
								displayedTasks: this.state.assignedTasks,
							});
						}}
					>
						Reset All Filters
					</DefaultButton>
				</div>
				<DetailsList
					items={this.state.displayedTasks}
					columns={taskColumns}
				/>
			</section>
		);
	}

	public componentDidMount(): void {
		this.props.context.msGraphClientFactory
			.getClient("3")
			.then((client: MSGraphClientV3) => {
				client
					.api(`planner/plans/${planId}/tasks`)
					.get((_error, tasks: any, rawResponse?: any) => {
						let responseTasks: Task[] = [];

						tasks.value
							// .filter(
							// 	(t: any) =>
							// 		t.bucketId ===
							// 			"cOuM55pwr0aCGL9JjbDT2WQAG0Y8" ||
							// 		t.bucketId ===
							// 			"EpjOIvAQt0SGP879bm8Q7WQAHaN0" ||
							// 		t.bucketId ===
							// 			"97XSMButykCukouGUKdiXGQAJxiS"
							// )
							.filter((t: Task) => t.percentComplete !== 100)
							.map((task: any) => {
								const assignedToKeys = Object.keys(
									task.assignments
								);
								let assignedTo = "";
								assignedToKeys.forEach((assignee: string) => {
									const matchingOption = options.find(
										(option) => option.key === assignee
									);
									if (matchingOption) {
										assignedTo +=
											matchingOption.text + ", ";
									}
								});

								// Remove trailing comma and space
								if (assignedTo.endsWith(", ")) {
									assignedTo = assignedTo.slice(0, -2);
								}
								const dueDateTime = task.dueDateTime
									? new Date(
											task.dueDateTime
									  ).toLocaleDateString()
									: "";
								responseTasks.push({
									id: task.id,
									title: task.title,
									assignedTo: assignedTo,
									dueDateTime: dueDateTime,
									bucketId: task.bucketId,
									percentComplete: task.percentComplete,
								});
							});
						this.setState({
							assignedTasks: responseTasks /*.filter((task) => {
								return task.assignedTo?.some(
									(assignedToKey) => {
										return options.some(
											(option) =>
												option.key === assignedToKey
										);
									}
								);
							})*/,
							displayedTasks: responseTasks /*.filter((task) => {
								return task.assignedTo?.some(
									(assignedToKey) => {
										return options.some(
											(option) =>
												option.key === assignedToKey
										);
									}
								);
							})*/,
						});
					});
			});

		console.log("assignedTasks", this.state.assignedTasks);
	}

	private _filterByAssignedTo = (
		event: React.FormEvent<IComboBox>,
		option?: IComboBoxOption | undefined,
		index?: number | undefined
	): void => {
		const allTasks: Task[] = this.state.assignedTasks;
		const currentOptions = [...this.state.selectedOptions, option];
		const filteredTasks: Task[] = allTasks.filter((task: Task) => {
			return option?.key && task.assignedTo === option?.text;
		});
		// const filteredTasks: Task[] = allTasks.filter((task: Task) => {
		// 	return task.assignedTo?.some((assignedToKey) => {
		// 		return option?.key === assignedToKey;
		// 	});
		// });

		this.setState({ displayedTasks: filteredTasks });
	};

	private _filterByBucket = (
		event: React.FormEvent<IComboBox>,
		option?: IComboBoxOption | undefined,
		index?: number | undefined
	): void => {
		const allTasks: Task[] = this.state.displayedTasks;

		let currentOptions = [];
		currentOptions = [...this.state.selectedOptions, option];

		console.log("current option:", option);
		// if (option) {
		// 	console.log("option.selected before", option.selected);
		// 	option.selected = !option.selected;
		// 	console.log("option selected after", option.selected);
		// }
		// if (option && option.selected) {
		// 	currentOptions.push(option);
		// } else {
		// 	currentOptions = currentOptions.filter(
		// 		(opt) => opt?.key !== option?.key
		// 	);
		// }

		const filteredTasks: Task[] = allTasks.filter((task: Task) => {
			return option?.key && task.bucketId === option?.key.toString();
		});

		this.setState({ displayedTasks: filteredTasks });
		// if (option) {
		// 	const optionIndex = currentOptions./*indexOf(option)*/
		// 	findIndex(
		// 		(opt) => opt?.key === option.key
		// 	);
		// 	console.log("option index:", optionIndex);
		// 	if (optionIndex > -1 && currentOptions.length > 1) {
		// 		// Option is already selected, remove it
		// 		console.log("removing option");
		// 		currentOptions.splice(optionIndex, 1);
		// 	} else {
		// 		// Option is not selected, add it
		// 		console.log("adding option");
		// 		currentOptions.push(option);
		// 	}
		// }
		// if (currentOptions.length > 0) {
		// 	currentOptions.forEach((option: IComboBoxOption) => {
		// 		allTasks.forEach((task: Task) => {
		// 			if (task.bucketId === option?.key.toString()) {
		// 				filteredTasks.push(task);
		// 			}
		// 		});
		// 	});
		// } else {
		// 	filteredTasks = allTasks;
		// }
		// this.setState({ displayedTasks: filteredTasks });
		console.log("current options:", currentOptions);
	};

	private _getAssignedTo = (assignedToKeys: string[]): string => {
		let assignedTo: string = "";

		// assignedToKeys.forEach((assignee: string) => {
		// 	assignedTo += assignee + ", ";
		// });
		assignedToKeys.forEach((assignee: string) => {
			const matchingOption = options.find(
				(option) => option.key === assignee
			);
			if (matchingOption) {
				assignedTo += matchingOption.text + ", ";
			}
		});

		// Remove trailing comma and space
		if (assignedTo.endsWith(", ")) {
			assignedTo = assignedTo.slice(0, -2);
		}

		return assignedTo;
	};
}
