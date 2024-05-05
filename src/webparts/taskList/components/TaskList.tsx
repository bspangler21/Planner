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
	IComboBox,
	IComboBoxOption,
	mergeStyleSets,
} from "@fluentui/react";
import { Task } from "../types/Task";
import { buckets, planId } from "../../../Hidden";
import { getTaskDetails } from "../services/TaskDetailService";

const options: IComboBoxOption[] = [
	{ key: "1", text: "Option 1" },
	{ key: "2", text: "Option 2" },
	{ key: "3", text: "Option 3" },
];

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
});

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
				<div>
					<ComboBox
						label="Filter by Bucket:"
						options={buckets}
						// defaultSelectedKey={defaultKey}
						multiSelect
						onItemClick={this._filterByBucket}
						className={classNames.comboBox}
					/>
				</div>
				<table>
					<thead>
						<tr>
							<th className={classNames.largeHeader}>Title</th>
							<th className={classNames.regularHeader}>
								Due Date
							</th>
							<th className={classNames.largeHeader}>
								Team Members
							</th>
						</tr>
					</thead>

					<tbody>
						{this.state.displayedTasks &&
							this.state.displayedTasks.map((task: Task) => (
								<tr
									key={task.id}
									// onClick={getTaskDetails(
									// 	task.id,
									// 	this.props.context
									// )}
								>
									<td>{task.title}</td>

									<td>{task.dueDateTime}</td>
									<td>
										{task.assignedTo &&
											this._getAssignedTo(
												task.assignedTo
											)}
									</td>
								</tr>
							))}
					</tbody>
				</table>
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
							.map((task: any) => {
								const assignedToKeys = Object.keys(
									task.assignments
								);
								const dueDateTime = task.dueDateTime
									? new Date(
											task.dueDateTime
									  ).toLocaleDateString()
									: "";
								responseTasks.push({
									id: task.id,
									title: task.title,
									assignedTo: assignedToKeys,
									dueDateTime: dueDateTime,
									bucketId: task.bucketId,
								});
							});
						this.setState({
							assignedTasks: responseTasks,
							displayedTasks: responseTasks.filter(
								(task) => task.bucketId === defaultKey
							),
						});
					});
			});

		console.log("assignedTasks", this.state.assignedTasks);
	}

	private _filterTasks = (
		event: React.FormEvent<IComboBox>,
		option?: IComboBoxOption | undefined,
		index?: number | undefined
	): void => {
		const allTasks: Task[] = this.state.assignedTasks;
		const currentOptions = [...this.state.selectedOptions, option];
		const filteredTasks: Task[] = allTasks.filter((task: Task) => {
			return task.assignedTo?.some((assignedToKey) => {
				return option?.key === assignedToKey;
			});
		});

		this.setState({ displayedTasks: filteredTasks });
	};

	private _filterByBucket = (
		event: React.FormEvent<IComboBox>,
		option?: IComboBoxOption | undefined,
		index?: number | undefined
	): void => {
		const allTasks: Task[] = this.state.assignedTasks;

		let currentOptions = [];
		currentOptions = [...this.state.selectedOptions, option];

		console.log("current option:", option);
		if (option) {
			console.log("option.selected before", option.selected);
			option.selected = !option.selected;
			console.log("option selected after", option.selected);
		}
		if (option && option.selected) {
			currentOptions.push(option);
		} else {
			currentOptions = currentOptions.filter(
				(opt) => opt?.key !== option?.key
			);
		}

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
