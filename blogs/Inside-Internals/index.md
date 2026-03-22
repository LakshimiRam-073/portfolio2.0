---
title: Custom Memory allocator in C
date: 2026-03-22
description: Making a custom memory allocator to know, what a memory allocator is.
author: Lakshimi Raman S
---

# Custom Memory allocator in C


# Prerequisites

Inorder to know what a memory allocator is we need to know how to process gets its memory and how the memory is split between the process. And to know the basic C knowledge(which I mention to know what a 'malloc' is). And some basic data structures



**What is a Process's memory?**

In each process the OS will allocate some virtual memory to use that for a process..Think of it like giving you some own flat where you can do anything. And you won't interfere with your space with some other flat mates.

1. Stack - It stores the local variables and the frame space for execution of process.
2. BSS - It stores the uninitialized global variables and the constants
3. Data - It stores the initialized global variables and the constants
4. Code - It stores the actual instructions to the execution of the process.
5. Heap - It is where the actual data will be processed.

These are called the Memory segments. Think of it like a flat with a Room, Hall, Kitchen, Dining, Balcony..

When it comes to Stack it requires less memory (Usually **8MB** for a process) You can find it by `ulimit -s`. But when it's Heap it will outgrow to such extend.

**Note:&#x20;**`ulimit` command is the setting given by Linux OS to configure and control the user limit to the memory. You can able to set limits to how much process, memory, stack meomry, etc... it can run on the OS for that user.

## malloc

```c
int *arr[10] = malloc(10 * size(int)); 
```

When you use malloc, it tries to fetch the memory from the heap and reserves it for you, you can use the memory for further operations. And if the memory heap is at its end (i.e Program break). Then it asks OS(sbrk syscall) to extend the heap of the process. Sounds easy right ?

**How does it knows where to fetch the memory?**

**How does it allocate memory?**

**What it actually does ? and what it is internally using ?**

**How do you free or reuse the memory?**

Let's see those questions answerd in a few minuites...



### Memory structure for memory allocation

Memory allocation is pretty simple, It is actually a linked list.. But it is being heavily used with more complications. TBH they will extend the Linked list to it's limits.

Heap is actually a contagious memory block. That's why I have mentioned OS will extend the memory block.

## Memory storage structure.

#### Block

The heap is divided into memory blocks that can be managed by the malloc or a memory allocator.

When you allocate memory of 100 bytes

```c
void *p = malloc(100);
```

It will be actually a block of memory will be allocated. What is exactly a block here ?

```
| metadata | 100 bytes usable by program |
            ^
            returned pointer (p)
```

This is exactly a block of storage. And what does the meta data looks like?

```c
typedef struct metablock{
  size_t size; // Size of the memory block(in our case 100)
  short int free; // to check the memory block is free
  struct metablock *next; // next memory block
// struct metablock *prev; //for complex algorithms
}metablock;
```

So each memory block will have it's own meta block and the block which is asked by the user.

OKKK, where is the head of the linked list.

```c
metablock *head = NULL;
```

The head is stored in BSS. Later it will be mapped at runtime.

## LL Structure

![Linked List Structure](/assets/yIzV6x2uA5SLjqjiYWWPQCV-pal8zx13WjGr8njfMBM=.png)

This how the memory looks like to a memory  allocator.



## Memory allocation

Ok then, How do they give it to the users?

**How do they create memory then ?&#x20;**

By requesting the OS with `sbrk`.

When we call sbrk(0) it gives the current limit of the heap ends in the process(i.e that is the address of page-break)

Then we would ask the sbrk by asking the passing the no of bytes we want sbrk(100). Then It will extend the heap by such bytes.

Example:

```c
    void *initial = sbrk(0);   // get current break
    printf("Initial break: %p\n", initial);

    void *block1 = sbrk(100);  // allocate 100 bytes
    printf("Allocated 100 bytes at: %p\n", block1);

    void *after1 = sbrk(0);
    printf("Break after allocation: %p\n", after1);
```

Which will give the following output


```
Initial break:        0x555555757000
Allocated 100 bytes:  0x555555757000
Break after:          0x555555757064
```

You see the heap end is moved by 100 bytes.

Then why does it return the same address in the second line? -> It gives the usable of the heap. 

#### How does it knows where to fetch the memory?

To be simple we need to traverse through the list and get the size block which is greater than the user asked and give the block.

but It is said to have 3 statergies for the traversal itself

1. First fit
2. Next fit
3. Best fit



I don't want to explain all that. You can able to get the understanding in this [Link](https://www.tutorialspoint.com/operating_system/os_memory_allocation_qa2.htm).

So we are using the First fit algo, but modern memory allocators use more advanced algorithms.

```c
metablock* check_current_free_blocks(size_t size){
  
  metablock* curr = head;
  while(curr){
    if(curr->free &&  curr->size >= size){
      return curr;
    }
    curr = curr->next;
  }
  return NULL;
  
}
```

&#x20;The above code is to check whether the size the user asked free memory block is present or not in the Linked list of blocks.

What happens if the user asked is 100 bytes and we gave a 500 byte block? It's easy just split the block and add the free block to the list.

But it requires precise calculation.

![Splitting memory blocks](/assets/lk74lxruVrbov_rTvYmMblSDNeDGgbt1U63Tge6K7Fo=.png)





To explain in a different way, I just made one drawing to say, we will split the available region to a new block and give the requested block to the user, this way we won't overallocate 

y\* is the new address of the block and A\* is the new blocks actual size.

```c
void split_block(metablock* block, size_t size){

  char *ptr_meta_block = (char *)(block + 1) + size;
  metablock *new_block = (metablock *)ptr_meta_block;

  new_block->free=1;
  new_block->next=block->next;
  new_block->size = block->size - sizeof(metablock) - size;

  block->next = new_block;
  block->size = size;
}

```

To explain the code, I used `char*`  to do pointer arithmetic to move `metablock` bytes.

#### &#xA;How does it allocate memory?

If not present in the Linked List then what ? We will ask the OS to extend.

```c
metablock *request_os_heap(size_t size){
  
  metablock *current_program_break = sbrk(0);
  metablock *request = sbrk(sizeof(metablock) + size);
  if (request == (void *) -1 )
  {
    return NULL;
  }
  //now extended by sbrk
  current_program_break->free=0;
  current_program_break->next=NULL;
  current_program_break->size=size;

  return current_program_break;
  
}
```

It will syscall the OS and get the heap from it.

#### &#x20;What it actually does ? and what it is internally using ?

Just combine all these and make some logic to have memory

* First we will check do we have any block does have any memory to use ? 
  * If we have block, just give the block
    * Ohh it's too large then, split and give.
  * If we don't have the block then ask from OS and extend the heap.



#### How do you free or reuse the memory?

We will reuse the memory just by marking it free (Just kidding). Freeing is also the most important here, If we have a list full of free 100 byte blocks, when the user asks for a 500 byte block. We will create or request the OS to give heap. Which will lead to serious [issues](https://www.quora.com/What-happens-when-heap-memory-is-full).

So to avoid fragmentation of memory blocks of not being used, we will just merge the blocks when it is freed

```c
void merge_free_blocks(){
  
  metablock *current = head;
  while (current && current->next)
  {
    if (current->free && current->next->free)
    {
      current->size += current->next->size + sizeof(metablock);
      current->free=1;
      current->next = current->next->next;
    }else{
      current = current->next;
    }
    
  }
  metablock *tmp = head;
  while (tmp && tmp->next) {
    tmp = tmp->next;
  }
  tail = tmp;
}

void custom_free(void *ptr){
  if (!ptr)
  {
    return; 
  }
  
  metablock* block = (metablock *)ptr -1;
  block->free=1;
  merge_free_blocks();
}

```

As I said, we will loop the memory blocks and make it merge if two contagious memory blocks present, to avoid fragmentation.



#### Results

Results were pretty good, able to split and merge the memory allocations.

```c
int main() {

int *a = custom_alloc(20);
int *b = custom_alloc(20);
int *c = custom_alloc(20);

print_heap();
custom_free(b);
custom_free(a);  // should merge a + b

print_heap();

custom_free(c);  // now merge all

print_heap();

int *d = custom_alloc(30);  // now split 

print_heap();
custom_free(d);  // now merge
print_heap(); 

return 0;

}
```

Able to easily merge the blocks when freeing well and split as well when the required block is less.

```
-----------HEAP---------
Meta: 0x62743bf7a000 | Data: 0x62743bf7a018 | Size: 20 | Free: 0 | Next: 0x62743bf7a02c
Meta: 0x62743bf7a02c | Data: 0x62743bf7a044 | Size: 20 | Free: 0 | Next: 0x62743bf7a058
Meta: 0x62743bf7a058 | Data: 0x62743bf7a070 | Size: 20 | Free: 0 | Next: (nil)
-----------END---------
-----------HEAP---------
Meta: 0x62743bf7a000 | Data: 0x62743bf7a018 | Size: 64 | Free: 1 | Next: 0x62743bf7a058
Meta: 0x62743bf7a058 | Data: 0x62743bf7a070 | Size: 20 | Free: 0 | Next: (nil)
-----------END---------
-----------HEAP---------
Meta: 0x62743bf7a000 | Data: 0x62743bf7a018 | Size: 108 | Free: 1 | Next: (nil)
-----------END---------
-----------HEAP---------
Meta: 0x62743bf7a000 | Data: 0x62743bf7a018 | Size: 30 | Free: 0 | Next: 0x62743bf7a036
Meta: 0x62743bf7a036 | Data: 0x62743bf7a04e | Size: 54 | Free: 1 | Next: (nil)
-----------END---------
-----------HEAP---------
Meta: 0x62743bf7a000 | Data: 0x62743bf7a018 | Size: 108 | Free: 1 | Next: (nil)
-----------END---------
```



## Final Note

* This is not a perfect implementation for the memory allocation.
* As it requires concurrency control,  more precise metablock to store less, inorder to have more data block.
* This will be posted in git, you can checkout there.

