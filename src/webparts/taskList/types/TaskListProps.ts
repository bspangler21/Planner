import { WebPartContext } from "@microsoft/sp-webpart-base";

export type TaskListProps = {
	description: string;
	isDarkTheme: boolean;
	environmentMessage: string;
	hasTeamsContext: boolean;
	userDisplayName: string;
	context: WebPartContext;
}
