public with sharing class SearchToDoItems {
    @AuraEnabled(Cacheable=true)
    public static List<ToDoItem__c> getToDoItemsList(String selectedStatus,
            String selectedPriority, String selectedCategory,
            String searchKey, Integer recordsOnPage, Integer offsetRecords) {
        String key = '%' + searchKey + '%';
        return [
                SELECT Id,
                        Name,
                        Description__c,
                        Status__c,
                        Priority__c,
                        Category__c,
                        CreatedDate
                FROM ToDoItem__c
                WHERE Status__c LIKE :selectedStatus
                AND Category__c LIKE :selectedCategory
                AND Priority__c LIKE :selectedPriority
                AND (Name LIKE :key OR Description__c LIKE :key)
                WITH SECURITY_ENFORCED
                ORDER BY Name
                LIMIT :recordsOnPage
                OFFSET :offsetRecords
        ];
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getTotalCountOfItems(String selectedStatus, String selectedPriority, String selectedCategory, String searchKey) {
        String key = '%' + searchKey + '%';
        return [
                SELECT COUNT()
                FROM ToDoItem__c
                WHERE Status__c LIKE :selectedStatus
                AND Category__c LIKE :selectedCategory
                AND Priority__c LIKE :selectedPriority
                AND (Name LIKE :key OR Description__c LIKE :key)
                WITH SECURITY_ENFORCED
        ];
    }
}