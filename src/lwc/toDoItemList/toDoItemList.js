import {LightningElement, wire, api} from 'lwc';
import getToDoItemsList from '@salesforce/apex/SearchToDoItems.getToDoItemsList';
import getTotalCountOfItems from '@salesforce/apex/SearchToDoItems.getTotalCountOfItems';
import {getObjectInfo} from "lightning/uiObjectInfoApi";
import {getPicklistValues} from "lightning/uiObjectInfoApi";
import TODOITEM_OBJECT from '@salesforce/schema/ToDoItem__c';
import CATEGORY_FIELD from '@salesforce/schema/ToDoItem__c.Category__c';
import STATUS_FIELD from '@salesforce/schema/ToDoItem__c.Status__c';
import PRIORITY_FIELD from '@salesforce/schema/ToDoItem__c.Priority__c';
import {refreshApex} from "@salesforce/apex";

const DELAY = 300;

export default class ToDoItemList extends LightningElement {
    toDoList;
    wiredToDoItemsListResult
    error;
    itemStatuses = [{label: 'All', value: '_%'}];
    itemCategories = [{label: 'All', value: '_%'}];
    itemPriorities = [{label: 'All', value: '_%'}];
    selectedStatus = '_%';
    selectedCategory = '_%';
    selectedPriority = '_%';
    searchKey = '';

    @api recordsOnPage = 2;
    offsetRecords = 0;
    pageNumber = 1;
    totalCountOfRecords = 0;
    wiredToCountOfItemsResult



    @wire(getToDoItemsList, {
        selectedStatus: '$selectedStatus',
        selectedPriority: '$selectedPriority',
        selectedCategory: '$selectedCategory',
        searchKey: '$searchKey',
        recordsOnPage: '$recordsOnPage',
        offsetRecords: '$offsetRecords'
    })
    wiredItems(result){
        this.wiredToDoItemsListResult = result;
        console.log(result.data);
           if (result.data) {
                this.toDoList = result.data;
                this.error = undefined;
            } else if (result.error) {
                this.error = result.error;
                this.toDoList = undefined;
            }
        }


    @wire(getTotalCountOfItems, {
        selectedStatus: '$selectedStatus',
        selectedPriority: '$selectedPriority',
        selectedCategory: '$selectedCategory',
        searchKey: '$searchKey',
    })
    wiredCOunOfItems(result){
        this.wiredToCountOfItemsResult = result;
        if (result.data) {
            this.totalCountOfRecords = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.totalCountOfRecords = undefined;
        }
    }

    createNewItem() {
        this.template.querySelector("c-to-do-item").createItem();
    }

    refreshToDoList(event) {
        this.refreshCountOfItemsResult()
            .then(() => refreshApex(this.wiredToDoItemsListResult));
    }

    refreshCountOfItemsResult() {
        return refreshApex(this.wiredToCountOfItemsResult);
    }

    @wire(getObjectInfo, {objectApiName: TODOITEM_OBJECT})
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: STATUS_FIELD
    }) wiredStatusValues({error, data}) {
        if (data) {
            this.itemStatuses = [...this.itemStatuses, ...data.values];
            if (error) {
                console.error(error)
            }
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: CATEGORY_FIELD
    }) wiredCategoryValues({error, data}) {
        if (data) {
            this.itemCategories = [...this.itemCategories, ...data.values];
            if (error) {
                console.error(error)
            }
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: PRIORITY_FIELD
    }) wiredPriorityValues({error, data}) {
        if (data) {
            this.itemPriorities = [...this.itemPriorities, ...data.values];
            if (error) {
                console.error(error)
            }
        }
    }

    handleChangeCombobox(event) {
        switch (event.target.name) {
            case "statusCombobox":
                this.selectedStatus = event.detail.value;
                break;
            case "categoryCombobox":
                this.selectedCategory = event.detail.value;
                break;
            case "priorityCombobox":
                this.selectedPriority = event.detail.value;
                break;
        }
    }

    handleKeyChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
        }, DELAY);
    }

    handlePaginationChange(event) {
        this.pageNumber = event.detail;
        this.offsetRecords = (this.pageNumber - 1) * this.recordsOnPage;
       }
}