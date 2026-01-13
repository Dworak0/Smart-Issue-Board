export interface Issue {
    id: string;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Done';
    assignedTo: string;
    createdAt: number;
    createdBy: string;
}
