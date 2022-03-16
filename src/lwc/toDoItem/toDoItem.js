import {LightningElement, api, wire} from 'lwc';
import {NavigationMixin} from "lightning/navigation";
import {deleteRecord} from "lightning/uiRecordApi";
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import OBJECT_API_NAME from '@salesforce/schema/ToDoItem__c';
import NAME_FIELD from '@salesforce/schema/ToDoItem__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/ToDoItem__c.Description__c';
import PRIORITY_FIELD from '@salesforce/schema/ToDoItem__c.Priority__c';
import CATEGORY_FIELD from '@salesforce/schema/ToDoItem__c.Category__c';
import STATUS_FIELD from '@salesforce/schema/ToDoItem__c.Status__c';


export default class ToDoItem extends NavigationMixin(LightningElement) {
    @api toDoItem;
    showCreateOrEditItemFormInModel = false;
    objectApiName = OBJECT_API_NAME;
    toDoItemId;
    fields = [NAME_FIELD, DESCRIPTION_FIELD, PRIORITY_FIELD, CATEGORY_FIELD, STATUS_FIELD];
    createOrEdit = '';
    createdOrEdited = '';


    get categoryColor() {
        switch (this.toDoItem.Category__c) {
            case "Today" :
                return "red"
            case "Tomorrow" :
                return "yellow"
            case "Later" :
                return "green"
        }
    }

    editItem(event) {
        this.toDoItemId = event.target.dataset.recordid;
        this.createOrEdit = 'Edit';
        this.showCreateOrEditItemFormInModel = true;
    }


    @api createItem() {
        this.createOrEdit = 'Create';
        this.showCreateOrEditItemFormInModel = true;
    }

    deleteItem(event) {
        const recordId = event.target.dataset.recordid;
        deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Item deleted',
                        variant: 'success'
                    })
                );
                this.dispatchEvent(new CustomEvent('delete'));
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'Error deleting record',
                        variant: 'error'
                    })
                );
            });
    }

    handleSuccess(event) {
        if (this.createOrEdit === 'Edit') {
            this.createdOrEdited = 'Edited'
        } else this.createdOrEdited = 'Created'
        const evt = new ShowToastEvent({
            title: `Item ${this.createdOrEdited}`,
            message: 'Record ID: ' + event.detail.id,
            variant: 'success',
        });
        this.toDoItemId = '';
        this.dispatchEvent(evt);
        this.showCreateOrEditItemFormInModel = false;
        this.dispatchEvent(new CustomEvent('save'));
    }

    handleCancel(event) {
        this.toDoItemId = '';
        this.showCreateOrEditItemFormInModel = false;

    }
}