---
title: Chapter 2
date: 2026-04-3
description: BTree and Disk.
author: Lakshimi Raman S
---

# Chapter 2

# BTree and Disk

Note: Don't consider it as the perfect replica/ Exact notes of the book. It may have some of my ideas and findings about the topics and changes from the original content.



## Data Structure to use?

We know Data structures right?(I hope you guys do) These guys helps us to store the data and manipulate them with their rules, to achieve greater speed to access and manage them. But Only in In-Memory.

Because If I say take the node 10 and put it right next to node 1, It will work in an instant, just takes microseconds to do the job(at max). At best case it would take 10 nanoseconds. So we can use the data structures easily to manipulate at our own will. 

Because the data structures we are talking only works well on Memory(RAM), where random access is fast.

But when it come to databases, there are concerns. We cannot use the same data structures there. WHY?

1. The Data is too big to hold in memory -> So we have to hold them in persistence medium i.e a Disk, a HDD or SSD.
2. If a Disk is used then the access speed will be lesser. The speed will be lesser, it will bring down our speed to milliseconds.

> **What it's just milliseconds? It is way lesser right?**
> Well in 1 nanosecond (10⁻⁹ s) - Light could travel approximately 30 cm.
> Well in 1 millisecond (10⁻³ s) - Light could travel approximately 300km.

So if we are going to access the disk for any operation it would be so costly.



## Binary Search

The easiest way to find the data(In - memory) would be a Binary Search Tree(BST), because it has a search complexity within O(log₂ N). And it would be easier to manage the data.

We can just balance the trees when the data is random or not in order.

> **How do you find a imbalanced tree?**
> The difference between the subtrees height will not above 1.

Actually we are pretty close to the solution. But we can't use the BST anyways.



Because the are 2 main reasons we can't take the BST

1. Hieght of a tree.
2. No. of children per node.



Why Hieght of a tree?

If we are having a million records, just span accress the tree the hieght will be h ≈ log₂(1,000,000) ≈ 20. So if we have to find a node, we should seek a disk 20 times? That is crazy... each time approximately we would get 20 milliseconds if HDD, so we would get 20 x 20 ms, which will be 400 ms approximately half second.

So we have to make sure that the nodes that span across more hieghts will cause us issue, to find a value we should maximum look upto only 2-3 times.



Why no of children matter?

When we query the database, we would like to give ranges and > , < signs to get the values to get more. In BST we should probably go down the subtree and seek the values.

And a new insert comes, it has to travel across all over the BST and make their place in the leaf. If it has a height of 20, It would take 20 disk seeks. We cannot afford that too..

So we need to store the nodes closer to the parents and the nodes should not span accross disks.

So, 

1. High fanout requires for neighbouring nodes.
2. Low Hieght requires to have lesser disk seeks.



## Disks

Have you ever wondered why the Disk access is so time taking?

### HDD (Hard Disk Drives)

How a [Hard disk](https://cs.stanford.edu/people/nick/how-hard-drive-works/) works?

It consists of a Platter(Plate) and a Read, Write head which will point a the platter and read or write the data over the disk. The disk will spin with such a high speed(5000-7200 RPM) and the head position itself to the right and correct sector and read or write the data.

The smallest unit transfer in a spinning disk is a sector. And a sector will be ranged about (512 bytes to 4KB).

The positioning the head is one of the most expensive part, because each time a disk seek happens it needs to reposition itself and get the data from the disk. 

But by writing it in sequential manner(Sequential I/O) we can able to get the data without repositioning the head.



### SSD (Solid State Drives)

How a [SSD](https://codecapsule.com/2014/02/12/coding-for-ssds-part-1-introduction-and-table-of-contents/) works?

It does not have any moving parts or so, It uses NAND Flash memory(When I was in college I used to wonder about NAND is everyhwere). The NAND flash memory is packed as cells. And connected with strings and an array of strings make it to a Page(\~4KB) and approx 256 pages will be called as a block and blocks arranged called as plane, a plane grouped called as a Die.

![](/assets/hXJJYnEvhFaP--y8SRr7iTcZQ0YoPvtaWRIuj1elj-0=.png "SSD internal schema design")

TBH Here a random read is possible..... Yeah we can use BST then? Hold on buddy...




A smallest part that could be accessed here is page, and the accessing speed is fast. But when we erase it will erase the whole block(Erasure is costly here). So we need to transfer the live pages, move to another block to do erasure on a single block. And it will be done by garbage collector. This is called as Write amplification.

Again we need to have the help of B-Trees. When a write occurs, it actually uses the sequential I/O to write whole block(we  presume) and If the block is deleted as whole then we don't need to move around any pages.



I would like to have a seperated blog about Persistent drives(HDD and SSD) which should cover how they are being used by our OS and Kernel. And how LBA works in them.



## Ubiquitous B-Tree

It is found in most of the Relational databases out there, and still being widely used to find data over disk. Why B-Tree? Why we have to choose over BST ?

1. It has a better Fanout compared to the BST.
2. And Data is stored near it's parents.

These are all the cases needed for a better data structure in disk.

The B-Tree solves this with two simple but powerful properties that make it disk-native. 

First, it has dramatically higher fanout. Instead of two children per node, a B-Tree node of order m stores up to M−1 keys and m child pointers.

Typical database implementations use m values that let a single node hold 100 to 500 keys, depending on key size. 

The tree height drops to 3 or 4 even for tables containing billions of rows.

Second, keys and their associated child pointers live together in the same node. Data (or data pointers) therefore stays physically near its parent keys on disk. When the database reads a page(a single node) into memory, it brings in not just one comparison value but dozens or hundreds of them at once.

This locality reduces the number of expensive random I/O operations.



So, simply speaking even if you have a billions of records, it only takes 2-3 disk reads. so Hieght h ≈ logₘ(N), Where m -> no of keys per node, and N-> no of Keys.



Why a page = node ?

Pages were invented precisely for the hardware characteristics of rotating disks. Writing one large contiguous block is far cheaper than many tiny random writes, and OS and file-system caches work at page granularity and WAL (Write-Ahead Logging) and checkpointing are also page-based.



By mapping each B-Tree node to exactly one page, the database will ensure the structural change(split, merge, insert) evenly and make it sequential to disk.



Enough of this Boring B-Tree logic, Kindly read this article from [planet scale](https://planetscale.com/blog/btrees-and-database-indexes)(Not promotional). It will have it's own [visualization](https://btree.app/) of the B-tree. Because you can't do anything if you can't imagine.  And do checkout the split and merge logic they explained clearly.



Note: In Databases we use B+ Tree, still it is a variant of B Tree, but it has its own logic. 

1. The datas are only stored in Leaf nodes not on the internal nodes.
2. Internal nodes only store the seperator keys, to guide to the leaf node.



Now begins the boring stuff....

### Seperator keys

In a B-Tree, the keys stored in internal (non-leaf) nodes are called separator keys, index entries, or divider cells. These are not data records themselves ,they act purely as boundaries that split the tree into subtrees (also called branches or subranges).

![](/assets/0iyFuFHB1xPd-wazCZGP_sWFHsiDH6LFs79XnmHHJZ0=.png)

Source: [Database internals](https://www.oreilly.com/library/view/database-internals/9781492040330/)

Each separator key defines a clear partition:

* The first pointer in a node points to the subtree containing all keys less than the first separator key.
* The last pointer points to the subtree containing all keys greater than or equa&#x6C;**&#x20;to** the last separator key.
* For any two consecutive separator keys K_i-1 and K_i, the pointer between them leads to the subtree holding keys K_{i-1} ≤ K_s < K_i, where Ks is any key belonging to that subtree.



Note on variants: Many production systems (especially B+Trees used in PostgreSQL, MySQL InnoDB, etc.) add sibling pointers at the leaf level. These form a linked list (sometimes doubly-linked) that enables fast range scans without repeatedly ascending back to parent nodes. This avoids extra I/O for sequential access after the initial root-to-leaf descent.

### Bottum - UP

Unlike Binary Search Trees, which are typically built top-down, B-Trees grow **bottom-up**.

* New data is inserted into leaf nodes.
* When leaves fill and split, new internal nodes are created only as needed.
* The number of leaf nodes increases first, which in turn forces the creation of additional internal nodes and may increase tree height.



### Splitting and Merging

Ok ,  **When do we split the B-Tree nodes?**

Also called as Overflow.

For leaf nodes: if the node can hold up to N key-value pairs, and inserting one more key-value pair brings it over its maximum capacity N.

For nonleaf nodes: if the node can hold up to N + 1 pointers, and inserting one more pointer brings it over its maximum capacity N + 1

The Key-value pair here mentioned is subjected to change, Since Mysql InnoDB is Index organized file, So the Key would be the indexed key and the pair would be the whole row. Checkout the [chapter 1](https://www.stupidnotes.in/articles/Database-Internals/Chapter-1) to have more clearence.

Simple, if the Node(Page) holding greater than the Max no of keys that would hold, then the Node will promote the middle key to the top and make two nodes with having the left side goes to the Left child and Right side of the key goes to the Right side. Actually it is recursive till the Root Node.

Sounds so vauge and easy right ? actually This is the mechanism actually happens when we split.



**When do we merge the B-Tree nodes?**

This is also simple, When the nodes does'nt 

Also known as Underflow.

For leaf nodes: if a node can hold up to N key-value pairs, and a combined number of key-value pairs in two neighboring nodes is less than or equal to N.

For nonleaf nodes: if a node can hold up to N + 1 pointers, and a combined number of pointers in two neighboring nodes is less than or equal to N + 1.

If the Node(Page) does have free space to occupy the neighbouring node then the B-Tree would merge the two nodes and make it a single node.





## Final Note

The explainations here is not much to understand the B-Tree if you are learning through this article. I recommend the reading the planent scale [visualization](https://btree.app/) and the planet scale [blog](https://planetscale.com/blog/btrees-and-database-indexes) to have a better understanding of the B-Trees.

