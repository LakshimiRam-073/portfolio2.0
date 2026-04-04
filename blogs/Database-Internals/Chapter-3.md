---
title: Chapter 3
date: 2026-04-4
description: Disk structure to store a data in Databases.
author: Lakshimi Raman S
---
# Chapter 3

# File formats and Encoding



Note: Don't consider it as the perfect replica/ Exact notes of the book. It may have some of my ideas and findings about the topics and changes from the original content.



## Accessing Memory vs Disk

Memory access is actually different from the Disk access. If you wanted to access the memory you just use `malloc` and `free`(Considering that you know this functions), just like that to get the allocated memory. And the memory is much more transparent compared to the disk. 

When you allocate the memory using `malloc` , you don't know what's happening inside and we are just using the free space that we are using as in our code. We really don't know what happens inside the memory ? Does it have fragmentation? Does it reusing memory? Checkout the article of [Custom memory allocation](https://www.stupidnotes.in/articles/Inside-Internals/mem-alloc) to have indepth understanding.

But in Disk we need to store the data in block level to page level(should be contagious), to have easier access over the disk. whereas the memory allocation can or cannot be contagious

So, we have to manually handle the Fragmentation, Data layout, Serializing and Deserializing of the data in the disk. 



## Binary Encoding

To store the data effectively. How are we going to store the data is matter the most. We can't just store the struct inside a disk directly(You can, but that's not the whole point). We cannot use `malloc` or `free`. We need to deal with the byte stream in disk.

Speaking of byte stream, We need to talk about Endianess.

### Endianess

Endianess is nothing but the order of the bytes in the CPU architechture. Let’s take a 4-byte (32-bit) number `0x12345678` , It will have 4 bytes `12 34 56 78`

**Big-endian**

&#x20;   Store the Most Significant Bit first.(Big end first). The data access by the highest byte order.

```
Memory layout (low address -> high address)

+----+----+----+----+
| 12 | 34 | 56 | 78 | 
+----+----+----+----+
Access order:
Step 1 → 12  
Step 2 → 34  
Step 3 → 56  
Step 4 → 78
```

**Little-endian**

&#x20;   Store the Least Significant Bit first(Little end first). The data access by the lowest byte order.

```
Memory layout (low address → high address):

+----+----+----+----+
| 78 | 56 | 34 | 12 |
+----+----+----+----+

Access order:
Step 1 → 78  
Step 2 → 56  
Step 3 → 34  
Step 4 → 12
```

Most of the mordern(x86) archtiechtures use Little-endian. Why?

Because the little end is first to access, so we can do easy arithmetic operations instead of going to fetch the all the way from MSB to LSB.



### Serialization and Encoding

People will always confuse about Encoding and Serialization. So we are just going to make this simple.

**Serialization:&#x20;**&#x43;onverting the in-memory object to a byte of stream.

```c
struct User {
    int id;
    char name[10];
};
```

When we convert into a byte stream we have just the bytes

```
[ bytes of id ][ bytes of name ]
```

**Encoding:&#x20;**&#x44;eciding how these bytes are structured or formatted.

We need to decide, 

1. byte order
2. Field sizes
3. variable length data, Fixed length data 

```
| 4 bytes id | 1 byte name_len | N bytes name |
```



## Structure

Generally when we store data to disk, we usually use Pages. What does page should contain? Usually a page would contain Fixed Header, Page data and a Fixed trailer. A page can contain certain number of fields, Such as the `page_id`, or `page_type` in `flags`.

But most of the time, we store the info in the header itself.

![](/assets/rkoWBNzg-jcPomUMO4k2Vi27Cl9pj6G2wBuzpURAPf0=.png)

How are we storing data? We store the lengths or the offsets of the address of the data.

If we want to store the record info of some office Info.

```
Fixed-size fields:
| (4 bytes) employee_id       |
| (4 bytes) tax_number        |
| (3 bytes) date              |
| (1 byte) gender             |
| (2 bytes) first_name_length |
| (2 bytes) last_name_length  |

Variable-size fields:
| (first_name_length bytes) first_name |
| (last_name_length bytes) last_name   |
```

We store the info for the lengthss of the fixed sized data and the variable sized data. If we wanted to accesss the `first_name`, we just have to skip the fixed sized length(We can find it in the header) and take the data from the `first_name_length` bytes. Same goes for the last\_name, skip the first\_name\_length bytes from the fixed length. 

Let's assume  a row to get the full understanding (Used ChatGPT to generate this example :-)

```
employee_id       = 1234
tax_number        = 5678
date              = 230101   (YYMMDD → 3 bytes)
gender            = 'M'
first_name        = "Harish"  (6 bytes)
last_name         = "Kumar"   (5 bytes)
```

So the `first_name` length is 6 bytes and the `last_name` length is 5 bytes

How will the actuall data looks like 

```
00 00 04 D2
00 00 16 2E
23 01 01
4D
00 06
00 05
48 61 72 69 73 68
4B 75 6D 61 72
```

Seriously we can't able to tell what is this right? If you have structured it you can see through this easily.

```
Offset ->
+----------------------+----------------------+------------------+---------+---------------------+---------------------+
| employee_id (4B)     | tax_number (4B)      | date (3B)        | gender  | first_name_len (2B) | last_name_len (2B)  |
+----------------------+----------------------+------------------+---------+---------------------+---------------------+
| 00 00 04 D2          | 00 00 16 2E          | 23 01 01         | 4D      | 00 06               | 00 05               |
+----------------------+----------------------+------------------+---------+---------------------+---------------------+

+------------------------------+----------------------------+
| first_name (6B)              | last_name (5B)             |
+------------------------------+----------------------------+
| 48 61 72 69 73 68            | 4B 75 6D 61 72             |
|  H  a  r  i  s  h            |  K  u  m  a  r             |
+------------------------------+----------------------------+
```

To access the `first_name` we just have to take the length of that and the fixed size length in the header itself. Same goes for the `last_name`.

And this is how a row stored in disk.

**Page structure**

Leaf nodes store key–value pairs, while non-leaf nodes store keys along with pointers to child pages. 

![](/assets/VimQYY0QFO-HZR9d2I64K9CbZhSgJGZD_48mLX_a0io=.png)

Source: [Database internals](https://www.oreilly.com/library/view/database-internals/9781492040330/)

In the original B-Tree design for fixed-size records, each page is organized as a simple sequence of triplets: key, value, and pointer. While this layout is straightforward, it has limitations—especially when inserting keys in the middle, which requires shifting existing entries, and it does not handle variable-sized records efficiently.

**Downsides**

There are many downsides in using this structure. 

a. We have to reclaim the space of the deleted row. But we can't reclaim perfectly

b. It doesn't allow managing variable sized data so nicely.



Why we can't reclaim the deleted data perfectly?

Consider we have 3 records

```
Record A -> 50 bytes  
Record B -> 100 bytes  
Record C -> 30 bytes  
```

Now we are deleting Record B (100 Bytes), we have a 100 byte hole

There are 3 cases here.

CASE 1: New record = 100 bytes ->  fits perfectly

CASE 2: New record = 60 bytes -> 40 byte hole(wasted)

CASE 3: New record = 120 bytes -> we need to allocate somewhere else.



Even if You use fixed size segments, the same issue would occur. 

If we wanted to reclaim space perfectly we have to rewrite the whole page. 

If the fixed segment is 64bytes, then the wasted bytes would be

```
64 - (N % 64)
```

N = record size.

The goal is to have 

1. Variable sized records can be easily maintained without rearanging
2. Space reclaimation should be easier.
3. Reference to the outer page of the record should be maintained.



### Data Layout

Each and every database should have a data layout to the disk (If using persistence). Data layout is nothing but how we are managing the data over the Disk.  Whe we mention about the data. We should have a clear map on how the  primitive fileds , Variable sized fields should occupy the space. In databases we can wrap fields with cells, cells with Pages, Pages with section and sections with Regions

 

![](/assets/EJHkSL3_-w52axOXGWu5q4l8_d6_PCUkhgQdwGLYcRI=.png)

We will briefly talk about the Cells later.

### Slotted Pages

Where each record is considered to be a cell or slot in the pages. We will store only the slot offsets in the after  the Header. With just the offset we can directly go to the cell easily.

A slotted page will have a fixed header and pointer offsets to the cells containing the data with variable sizes. We just need to reorder the pointer offsets to know the data values and preserve the ordering. The cells can be anything like keys, pointers and even data records with variable size.



![](/assets/C9uxt6_ic8Xn-tL1DFyJpNBXT0Vt0w4zRVMNlZfv8iM=.png)

Source: [Database internals](https://www.oreilly.com/library/view/database-internals/9781492040330/)



• Minimal overhead: the only overhead incurred by slotted pages is a pointer array holding offsets to the exact positions where the records are stored.(Perfect)

• Space reclamation: space can be reclaimed by defragmenting and rewriting the page.(Hell nah, can't afford that)

• Dynamic layout: from outside the page, slots are referenced only by their IDs, so the exact location is internal to the page.( Yeah pefect too)

###

### Cells

A cell is actually a record, where in a much more formated way. A comprised form of fields we could store. There are actually two cells we can mention, Key cell and Key-value pair cell.

**Key cell**

Key cells are usually used in the inner nodes and not on the leaf nodes. It might comprise of 

1. Cell Type(Probably can have it in Header)
2. Key size
3. ID of the child this cell is pointing to..

```
0                4                8
+----------------+---------------+-------------+
| [int] key_size | [int] page_id | [bytes] key |
+----------------+---------------+-------------+
```

We don't need the `key_size` too, If we are using a fixed `key_size`. And most of the time we usually see it in the internal nodes.(PostgreSQL uses similare cell type)

**Key-value pair cell**

The key-value cells hold data records instead of the child page IDs. Otherwise, their Cell type (can be inferred from page metadata)

1. Key size
2. &#x20;Value size
3. &#x20;Key bytes
4. &#x20;Data record

```
0        1        5        9        9 + key_size        9 + key_size + value_size
+--------+--------+--------+--------+------------------+------------------------+
| flags  | key_size        | value_size      | key bytes | data_record bytes     |
| (1B)   | (4B)            | (4B)            | (N bytes) | (M bytes)             |
+--------+-----------------+-----------------+-----------+----------------------+
```

### Combining Cells into Slotted Pages

The most crucial part is to understand how they use slotted pages and cells to pull out the database page management. THIS is quite important to know.

![](/assets/uJgyzD2nSvgAPQ0eUfAep4KTlC1W9vgamz7QJAjIIA0=.png)

Source: [Database internals](https://www.oreilly.com/library/view/database-internals/9781492040330/)

So, Here there is a lot to say TBH. We are going to store the offsets and The cells in the same page itself, with a little bit of different approach. Just the offsets points to the cells now.

When a Insert comes we are just storing the DATA part in the insertion order. 

Why ? the data should be sorted right? that's what the rule of B-Trees.

Yes, obviously. But we won't sort the data part, we will just sort the offsets. That's all.

To make it short:

**Actual data (cells) :&#x20;**&#x53;tored in insertion order

**Offset array (pointers to cells):&#x20;**&#x53;tored in sorted order



For example:

IF the data comes in a order with Tom, Lesle  and Ron.

In data it will be appended in the direction of cell growth.

```
[ Leslie ][ Ron ][ Tom ]
```

but the offset pointer positions will be 

```
[ offset(Leslie), offset(Ron), offset(Tom) ]
```

By this, many of our wories have been cleared.

1. Insert in Middle ? -> just move the pointers
2. Insert in the end -> just add a pointer
3. Delete -> just null the pointer



So removing an Item doesn't need to actually delete the cell, instead we can maintain a in-memory map to know the cells that have can be freed and reused by moving the data blocks in some maintanence time(VACCUM in PostgreSQL).



### Page ID and Cell offset

How are we going to use these Page Id and cell  offset to find the data ? Do we able to find the data with just these two?

Yes you can. When we requested a data we will just find the file which stores the table. Then We just have to scoop the correct page for the record. Let's say our page was stored in page 2, and cell offset 300. 

This is how the file mental model would be

```
 [ Page 0 ][ Page 1 ][ Page 2 ][ Page 3 ]
```

Each page is fixed size (say 4KB). So:

```
Page 0 → starts at byte 0
Page 1 → starts at byte 4096
Page 2 → starts at byte 8192
```

We can just use the `page_id` to find the `file_offset`. where `file_offset`is the starting point of the page where we looking for, with `file_offset = page_id × page_size`

we found out the `file_offset = 8192`. we managed to scoop the page into the memory now.

Inside Page 2 we have cell offsets like 

```
Page 2 (starts at byte 8192 in file)

Cell A → offset 100
Cell B → offset 300
```

Then in memory we just want to do binary search in the page or just loop through the cells to find the key we are looking for. 

So, If our page is in Cell B which has offset 300, then we add the `file_offset` and the `page_offset` which we found in the cell B ->300 . Which will be `8192+300 = 81492` is the desired cell we want to have.

Why not full size like 8492 just 300? 

We will store the offset of the page which will have 2 - 4 byte at max. So we are using it with relative to `page_id`

