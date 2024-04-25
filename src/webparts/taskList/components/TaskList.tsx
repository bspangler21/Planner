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
import { planId } from "../../../PlanId";

const options: IComboBoxOption[] = [
	{ key: "1", text: "Option 1" },
	{ key: "2", text: "Option 2" },
	{ key: "3", text: "Option 3" },
];

const classNames = mergeStyleSets({
	header: {
		width: "300px",
		fontSize: "20px",
		fontWeight: "bold",
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
						label="Filter by team member"
						options={options}
						// defaultSelectedKey={"zzz"}
						multiSelect
						onItemClick={this._filterTasks}
					/>
				</div>
				<table>
					<thead>
						<tr>
							<th className={classNames.header}>Title</th>
							<th className={classNames.header}>Due Date</th>
						</tr>
					</thead>

					<tbody>
						{this.state.assignedTasks &&
							this.state.assignedTasks.map((task: Task) => (
								<tr key={task.id}>
									<td>{task.title}</td>

									<td>{task.dueDateTime}</td>
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

						tasks.value.map((task: any) => {
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
						this.setState({ assignedTasks: responseTasks });
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
		let filteredTasks: Task[] = [];
		const currentOptions = [...this.state.selectedOptions, option];
		currentOptions.forEach((option: IComboBoxOption) => {
			switch (option?.key) {
				case "1":
					allTasks.forEach((task: Task) => {
						if (
							task.assignedTo &&
							task.assignedTo.indexOf(option?.key.toString()) > -1
						) {
							filteredTasks.push(task);
						}
					});
					break;
				case "2":
					allTasks.forEach((task: Task) => {
						if (
							task.assignedTo &&
							task.assignedTo.indexOf(option?.key.toString()) > -1
						) {
							filteredTasks.push(task);
						}
					});
					break;
				default:
					console.log("No option selected");
					filteredTasks = allTasks;
					break;
			}
		});

		this.setState({ displayedTasks: filteredTasks });
	};
}
