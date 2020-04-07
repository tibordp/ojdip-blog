---
title: "Implementing a variant type from scratch in C++"
date: "2013-10-09"
---

When programming in C++ we sometimes need heterogeneous containers that can hold more than one type of value (though not more than one at the same time). If our container needs only contain basic types and Plain Old Data Structures, the solution is simple:

```cpp
union simple_variant_1 {
   int as_integer;
   bool as_bool;
   float as_float
}
```

If we want to know which type is stored inside, we can make a tagged union, something along the lines of:

```cpp
struct simple_variant_2 {
   enum {t_int, t_bool, t_float} type_id;
   union {
      int as_integer;
      bool as_bool;
      float as_float
   }
}
```

From the efficiency standpoint, this is probably almost an optimal solution. An union will only consume as much space as the largest of its member types. If we try to access the `as_float` member variable when the actual value stored is `int`, we will see implementation-dependent gibberish values but that's OK because we know we are accessing the wring type. Likewise, basic types do not need to be initialized or finalized - they can safely contain gibberish and after we are done using them, they don't need to do free memory, clean up global state etc.

The problem of course arises, when we want to use "smart" objects, such as `std::string`, `std::vector`, ... in our union. These types implement custom constructors, copy and move operators, destructors, ... The internal structure of `std::string`, for example, contains a pointer to the string data. If this structure is not properly initialized, it will point to a random location in memory, causing a segmentation fault the first time we access it. If it is not finalized, the memory that it allocated will not be freed thus causing memory leaks.

This is exactly the reason why non-basic types were disallowed in C++ unions. When the union is created, there is simply no means of knowing which of its members should be initialized and when it goes out of scope, the compiler cannot know on which type to perform the destructor. In C++11, the [rules have been relaxed](http://en.wikipedia.org/wiki/C%2B%2B11#Unrestricted_unions), but this requires us to take the initializing/finalizing part into our own hands.

This is how a variant type implementation can look like. We use the rarely-used placement `new` syntax that allows us to decouple the memory acquisition and object initialization that the `new` operator provides, by performing only the initialization part on a memory that we already have. In the same manner, we have to manually call the destructor, because `free` also attempts to deallocate memory.

```cpp
struct variant {
   enum variant_type {t_int, t_string};
   variant_type type_;
   union {
      int as_integer;
      string as_string;
   };
   variant(variant_type type) : type_(type) {
       if (type == t_string)
           new (&as_string) string();
       else
           new (&as_integer) int();
   }
   ~variant() {
       if (type_ == t_string)
           as_string.~string();
       else
           as_integer.~int();
   }
};
```

Of course in the above example, we notice that `new (&int) as_integer` and `as_integer.~int()` are completely redundant, because integers do not need neither initialization nor finalization, so their constructors and destructors are NOP. This is included for consistency once we get to the point of using templates for generic variant types.

**Note:** In fact the above code does not even compile on GCC 4.8 and Clang 3.4, but when we use templates to refer to `int` with a generic template parameter, everything works as expected.

The above code works just well but this approach does not lend itself to implement generic templated types. What we would like is something, that can be used like this:

```cpp
variant<int, float, string> var;
var.as<string>() = "Hello world!";
cout << var.as<string>(); // Prints Hello World
var.as<int>() = 42;
cout << var.as<int>(); // Prints 42
var.as<float>() = 3.14;
cout << var.as<float>(); // Prints 3.14
```

In the following section we will build the fully-templated variant type from scratch.

### Basic construction

We begin the construction by evaluating the basic layout of our variant type. The approach with unions works well, when we have a hard-coded set of types to choose from, but not so much when we have a templated-type.

We start by setting the basic layout to something like this:

```cpp
struct variant {
   type type_id;
   char data[enough];
}
```

This of course raises the question of "How much is `enough`?". Since we need every object to fit into the container, it must be at least as big as the largest of the member types. This is the time to introduce a helper object and some variadic template magic:

```cpp
template<typename F, typename... Ts>
struct variant_helper {
  static const size_t size =
    sizeof(F) > variant_helper<Ts...>::size ? sizeof(F) : variant_helper<Ts...>::size;
};

template<typename F>
struct variant_helper<F>  {
    static const size_t size = sizeof(F);
};
```

We will use the helper object for everything that will require a template specialization for the case of one single member type so as to avoid the code duplication in the main variant class.

This allows us to define:

```cpp
template<size_t size>
class raw_data { char data[size]; };

template<typename... Ts>
struct variant {
  typedef variant_helper<Ts...> helper;

  type type_id;
  raw_data<helper::size> data;
}
```

We use the wrapper class `raw_data` to work around the awkwardness and inconsistency of C-style arrays. This also allows us to easily change the definition if we are programming for a platform where say, `sizeof(char) != 1`.

**Edit (10/11/2013):** as some have pointed out, this implementation of `raw_data` will [lead to alignment issues](http://en.wikipedia.org/wiki/Data_structure_alignment) on certain platforms, which can be alleviated by declaring the container type a union of all the variant member types. C++11 provides a [very nice container type that works with variadic templates](http://en.cppreference.com/w/cpp/types/aligned_union), that we can directly use in this code without any other changes. We can also use `aligned_storage`. The full source code has been updated.

### Type identification

We need a way to create a mapping between member types and values that will be stored in the `type_id` variable. We will use C++'s very handy RTTI utilities. This requires that the program be compiled with RTTI data and in theory it would be possible to implement this without using it but we would have to manually create type traits for _every_ type that we would like to use, like this:

```cpp
template<typename T> struct type_traits;
template<> struct type_traits<int> { static const size_t id = 0; };
template<> struct type_traits<string> { static const size_t id = 1; };
template<> struct type_traits<float> { static const size_t id = 2; };
/* ... */
```

This is useful in some cases, for example if we want to have precise control over the representation of the stored type ID, but very cumbersome when writing a general-purpose container. If we take a look at the [`std::type_info`](http://en.cppreference.com/w/cpp/types/type_info), we see that `typeid(T).hash_code()` is guaranteed to return a unique `size_t`\-typed value for every different type, making it ideal for our purposes.

It is also possible to have the types identified sequentially with some template magic, but we would like to have global type IDs, to allow for compatibility between the variant type instantiated with different sets of member types in a possible future expansion.

### Destructor

We will now look at the implementation of the destructor. The destructor has to go through every member type and check if it's ID matches the ID stored in the object. If this is the case, it has to cast the data to this member type and invoke its destructor. We create an external routine called `destroy` in the helper class, so that we don't have to specialize the main template:

```cpp
template<typename F, typename... Ts>
struct variant_helper {
  /* ... */
  inline static void destroy(size_t id, void * data)
  {
    if (id == typeid(F).hash_code())
      reinterpret_cast<F*>(data)->~F();
    else
      variant_helper<Ts...>::destroy(id, data);
  }
  /* ... */
};

template<typename F>
struct variant_helper<F>  {
  /* ... */
  inline static void destroy(size_t id, void * data)
  {
    if (id == typeid(F).hash_code())
      reinterpret_cast<F*>(data)->~F();
  }
  /* ... */
};

template<typename... Ts>
struct variant {
private:
  typedef variant_helper<Ts...> helper;

  size_t type_id;
  raw_data<helper::size> data;
public:
  /* ... */
  ~variant() { helper::destroy(type_id, &data); }
  /* ... */
};
```

### Initialization of objects

Contrary to [Boost.Variant's Never-Empty guarantee](http://www.boost.org/doc/libs/1_54_0/doc/html/variant/design.html#variant.design.never-empty), our variant type will allow the uninitialized state - the "empty container" - because it greatly simplifies matters. Ergo, we need only make the default constructor:

```cpp
template<typename... Ts>
struct variant {
  static inline size_t invalid_type() {
    return typeid(void).hash_code();
  }
  /* ... */
  variant() : type_id(invalid_type()) { }
};
```

Despite what we outlined in the introduction, we will have two functions to access the member types - `set()` and `get()`. `set()` will perfectly forward all of its parameters directly to `T`'s constructor, whereas `get()` will throw an error if we try to access the type that is not currently contained within.

```cpp
template<typename Ts>
struct variant {
  /* ... */
  template<typename T, typename... Args>
  void variant::set(Args&&... args)
  {
    // We must first destroy what is currently contained within
    helper::destroy(type_id, &data);

    new (&data) T(std::forward<Args>(args)...);
    type_id = typeid(T).hash_code();
  }


  template<typename T>
  T& get()
  {
    if (type_id == typeid(T).hash_code())
      return *reinterpret_cast<T*>(&data);
    else
      throw std::bad_cast();
  }
  /* ... */
}
```

### Copy and move semantics

At this point, the variant type is already usable, but its functionality is severely limited since it does not implement move/copy semantics, so we cannot use it in STL containers. Actually, it is worse. The implicitely defined copy constructor will just copy the contents of `data`, so when both copies fall out of scope, the object therein contained will be finalized twice, which will probably lead to a crash. It is therefore imperative to either implement custom constructors/operators or mark the object as non-copyable/non-moveable.

The move constructor is very simple, since we only need to steal the resources and invalidate the old instance:

```cpp
variant(variant<Ts...>&& old) : type_id(old.type_id), data(old.data)
{
  old.type_id = invalid_type();
}
```

The copy constructor involves some more work, since it has to invoke the suitable copy constructor of the member type of the object contained in the original container.

```cpp
template<typename F, typename... Ts>
struct variant_helper {
  /* ... */
  inline static void copy(size_t old_t, const void * old_v, void * new_v)
  {
    if (old_t == typeid(F).hash_code())
      new (new_v) F(*reinterpret_cast<const F*>(old_v));
    else
      variant_helper<Ts...>::copy(old_t, old_v, new_v);
  }
};

template<typename F>
struct variant_helper<F>  {
  /* ... */
  inline static void copy(size_t old_t, const void * old_v, void * new_v)
  {
    if (old_t == typeid(F).hash_code())
      new (new_v) F(*reinterpret_cast<const F*>(old_v));
  }
};

struct variant {
  /* ... */
  variant(const variant<Ts...>& old) : type_id(old.type_id)
  {
    // We need to do a "deep" copy, that is - invoke the copy constructor of the contained type.
    helper::copy(old.type_id, &old.data, &data);
  }
  ...
}
```

The last thing we need are the corresponding `operator=` implementations, everything as standard and some helper functions:

```cpp
variant<Ts...>& operator= (variant<Ts...>&& old)
{
  // We steal the data and invalidate the old value
  data = old.data;
  old.type_id = invalid_type();

  return *this;
}

variant<Ts...>& operator= (variant<Ts...> old)
{
  // Note the call-by-value above
  std::swap(data, old.data);
  std::swap(type_id, old.type_id);

  return *this;
}

// ----------------------------------------- //

template<typename T>
void is() {
  return (type_id == typeid(T).hash_code());
}

void valid() {
  return (type_id != invalid_type());
}
```

### Conclusion

This implementation does not use dynamic memory management/heap storage, so it should be quite efficient. It's goal is to be simple to understand but may not be so robust as heavy-duty implementations, such as Boost.Variant. It uses fancy C++11 features, so it will probably not work on older compilers The full source code is available [here](https://gist.github.com/tibordp/6909880).
