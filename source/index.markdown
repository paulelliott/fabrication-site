### Getting Started

#### What is Fabrication?

Fabrication generates objects in Ruby. Fabricators are schematics for your objects, and can be created as needed anywhere in your app or specs.

Fabrication can generate anything, but has specific support for
[ActiveRecord Models](http://guides.rubyonrails.org/active_record_querying.html),
[Mongoid Documents](http://mongoid.org"),
[Sequel Models](http://sequel.rubyforge.org),
and
[DataMapper Resources](http://datamapper.org).

#### Installation

Fabrication is tested against Ruby 2.2 and above.

To use it with Bundler, just add it to your gemfile.

`gem 'fabrication'`

#### Defining Fabricators

You can define a schematic for generating objects by defining Fabricators as `spec/fabricators/**/*fabricator.rb`.

Fabricators are loaded automatically - so as long as they're in the right place, you're good to go.

So let's say you have a `Person` model with the usual fields and some associations:

```ruby
class Person < ActiveRecord::Base
  belongs_to :neighborhood
  has_many :houses
end
```

You could then create a `Fabricator` to automaticaly generate copies of `Person` for your test suite.

```ruby
# located in spec/fabricators/person_fabricator.rb

Fabricator(:person) do
  neighborhood
  houses(count: 2)
  name { Faker::Name.name }
  age 45
  gender { %w(M F).sample }
end
```

Every time you fabricate a person, you'll get a brand-new instance of a
person model persisted to the database and containing the fields you specified.
In the case above, `neighborhood` and `houses` would automatically expand out
to use the fabricators for those models, and be persisted as well.

You can learn more on the Defining Fabricators tab.

#### Fabricating Instances

Once you've defined some fabricators, you can use them anywhere in your
application. This is especially useful in populate scripts for development and
staging environments, as well as in your test suite.

You can Fabricate a new instance of the person object we defined above every time you call:

`Fabricate(:person)`

You can also provide overrides to the default options at `Fabricate` time with
a hash or the same block syntax you used to define the Fabricator.

```ruby
Fabricate(:person, name: 'Paul Elliott', gender: 'M') do
  houses { [Fabricate(:house, location: 'the beach')] }
end
```

You can learn more about the options available at `Fabricate` time on the Fabricating Objects tab.

#### Getting Help

Email the fabrication [mailing list](https://groups.google.com/group/fabricationgem) if you need extra help or have specific questions. I'll answer you as quick as I can.

If all else fails, open an [issue on GitHub](https://github.com/paulelliott/fabrication/issues) and I'll take a look!

### Configuration

To override these settings, put a `fabrication.rb` in your support folder with a configure block

```ruby
Fabrication.configure do |config|
  config.fabricator_path = 'data/fabricators'
  config.path_prefix = Rails.root
  config.sequence_start = 10000
  config.generators << CustomGeneratorForORM
end
```

#### Supported Options

##### fabricator_path

Specifies the path within your project where Fabricator definitions are located.

Default: `['test/fabricators', 'spec/fabricators']`

##### path_prefix

Allows you to specify the location of your application on the file system. This is especially useful when working with Rails engines.

Default: `Rails.root if defined, otherwise '.'`

##### sequence_start

Allows you to specify the default starting number for all sequences. This can still be overridden for specific sequences.

Default: `0`

##### generators

Allows you to specify custom generators for non officially supported ORMs.

Default: `[]`

#### Pre-loading Fabricators

Fabrication doesn't load the defined fabricators until the first time you actually try to fabricate something. Here is an example for pre-loading them in cucumber.

```ruby
Before do
  Fabrication::Support.find_definitions
end
```

NOTE: The vast majority of users do not need to do this and I do not recommend it. Certain uses and instances require it though.

#### Defining Custom Generators

Fabrication has builtin support for most popular Ruby ORMs. If you want to implement your custom strategy for ActiveRecord or add support for a new ORM, you can add your own generator.

```ruby
class ImmutablePoroGenerator < Fabrication::Generator::Base
  def self.supports?(klass)
    # return true or false, if this generator can support `klass` or not
  end

  def build_instance
    self._instance = _klass.new(_attributes)
  end
end

Fabrication.configure do |config|
  config.generators << ImmutablePoroGenerator
end
```

### Defining Fabricators

#### Arguments

The first argument to the fabricator is the name you will use when fabricating
objects or defining associations. It should be the symbolized form of the class
name.

```ruby
class Person; end
Fabricator(:person)
```

To use a different name from the class, you must specify `from:
:symbolized_class_name` as the second argument.

```ruby
Fabricator(:adult, from: :person)
Fabricator(:adult, from: "SomeNamespace::Person")
```

The value of `:from` can be either a class-name string or symbol, or the name of another fabricator.

#### Attributes

The Fabricator block does not require a block variable, but one can be
supplied. You can list the attributes to be generated and they will be created
in order of declaration.

```ruby
Fabricator(:person) do
  name 'Greg Graffin'
  profession 'Professor/Musician'
end
```

To produce dynamic values, you can pass a block to the attribute.

```ruby
Fabricator(:person) do
  name { Faker::Name.name }
  profession { %w(Butcher Baker Candlestick\ Maker).sample }
end
```

Attributes are processed in order of declaration and fields above the current
one are available via a block parameter.

```ruby
Fabricator(:person) do
  name { Faker::Name.name }
  email { |attrs| "#{attrs[:name].parameterize}@example.com" }
end
```

To assign a Hash value you must to do so inside a block. If you do not, `Fabricate` will treat is as the options argument to the fabricated attribute (where you would normally define a count, custom fabricator, etc).

```ruby
Fabricator(:person) do
  settings do
    { favorite_color: 'yellow', egg_preference: 'scrambled' }
  end
end
```

#### Keywords

**Using keywords for field names is not a best practice!**

You can reference fields whose names are reserved keywords (alias, class, def, if, while, ...) with the block variable.

```ruby
class Person
  attr_accessor :alias, :codename
  alias aka codename
end

Fabricator(:person) do |f|
  f.alias 'James Bond'
  codename '007'
end

Fabricate(:person).aka #=> '007'
```

#### Associations

You can associate another fabricator by just writing the attribute name.
Fabrication will look up a fabricator of that name, generate the object, and
set it in the current object. This is great for `belongs_to` associations.

```ruby
Fabricator(:person) do
  vehicle
end
```

... is equivalent to ...

```ruby
Fabricator(:person) do
  vehicle { Fabricate(:vehicle) }
end
```

You can specify which fabricator to use in that situation as well.

```ruby
Fabricator(:person) do
  ride(fabricator: :vehicle)
end
```

... is equivalent to ...

```ruby
Fabricator(:person) do
  ride { Fabricate(:vehicle) }
end
```

You can also generate arrays of objects with the count parameter. The attribute
block receives the object being generated as well as the incrementing value. It works just like you would expect if you leave off the block.

```ruby
Fabricator(:person) do
  open_source_projects(count: 5)
  children(count: 3) { |attrs, i| Fabricate(:person, name: "Kid #{i}") }
end
```

Or for those times when you are trying to create random data with Fabrication...

* The `rand` parameter allows the count to be randomized. You can provide an integer and it will default to `1..x` or you can provide a range as the value.

```ruby
Fabricator(:person) do
  open_source_projects(rand: 5)
  children(rand: 3) { |attrs, i| Fabricate(:person, name: "Kid #{i}") }
  dogs(rand: 1..4)
end
```

If you have associations set up between two models you may see an issue of circular object generation. You can fix this by telling fabrication what the inverse of this association is so it knows not to generate an extra object on the other side.

```ruby
Fabricator(:widget) do
  wockets(count: 5, inverse_of: :widget)
end

Fabricator(:wocket) do
  widget(inverse_of: :widget)
end
```

#### Inheritance

You can inherit attributes from other fabricators by using the `:from` attribute.

```ruby
Fabricator(:llc, from: :company) do
  type "LLC"
end
```

Setting the `:from` option will inherit the class and all the attributes from the named Fabricator.

You can also explicitly specify the class being fabricated with the `:class_name` parameter.

```ruby
Fabricator(:llc, class_name: :company) do
  type "LLC"
end
```

#### Custom Initialization

If you don't want to build the object through the normal initialization means,
you can override it with the `initialize_with` option.

```ruby
Fabricator(:car) do
  initialize_with { Manufacturer.produce(:new_car) }
  color 'red'
end
```

The object instantiated and returned by the initialize_with block will have all
the defined attributes applied and it will be returned by the Fabricate method
call.

#### Callbacks

Fabrication has its own callback cycle that is completely separate from the one
provided by your ORM. You can use the following callbacks in your Fabricator
definition.

```ruby
after_build
before_validation
after_validation
before_save
before_create
after_create
after_save
```

**IMPORTANT:** The only callback executed when building an object is `after_build`.
The rest are only executed when you create an object using the regular
`Fabricate` call. However, when your Fabricator is automatically run via an association
created for another Fabricator, it will only run the `after_build` callback.

You can define them in your Fabricators as a block that optionally receives the
object being fabricated and a hash of any transient attributes defined. As with
anything that works in the Fabricator, you can also define them when you call
Fabricate and they will work just like you'd expect. The callbacks are also
stackable, meaning that you can declare multiple of the same type in a
fabricator and they will not be clobbered when you inherit another fabricator.

```ruby
Fabricator(:place) do
  before_validation { |place, transients| place.geolocate! }
  after_create { |place, transients| Fabricate(:restaurant, place: place) }
end
```

If you have an object with required arguments in the constructor, you can use
the `on_init` callback to supply them.

```ruby
Fabricator(:location) do
  on_init { init_with(30.284167, -81.396111) }
end
```

#### Aliases

You can provide aliases for a fabricator by supplying the :aliases option to
the Fabricator call.

```ruby
Fabricator(:thingy, aliases: [:widget, :wocket])
```

You can now call Fabricate with :thingy, :widget, or :wocket and receive back
the generated object.

#### Transient Attributes

Transient attributes allow you to have variables in the Fabricator that are not
set in the generated class. You can interact with them during attribute
generation as if they were regular attributes, but they are stripped out when
the attributes are mass-assigned to the object.

```ruby
Fabricator(:city) do
  transient :asian
  name { |attrs| attrs[:asian] ? "Tokyo" : "Stockholm" }
end
```

```ruby
Fabricate(:city, asian: true)
  # => <City name: 'Tokyo'>
```

You can specify multiple transients by passing them all to `transient`.

```ruby
Fabricator(:the_count) do
  transient :one, :two, :three
end
```

You can also specify default values with an options hash at the end.

```ruby
Fabricator(:fruit) do
  transient :color, delicious: true
end
```


#### Reloading

If you need to reset fabrication back to its original state after it has been
loaded, call:

```ruby
Fabrication.clear_definitions
```

This is useful if you are using something like Spork and reloading the whole
environment is not desirable.

### Fabricating Objects

#### The Basics

The simplest way to Fabricate an object is to pass the Fabricator name into
Fabricate.

```ruby
Fabricate(:person)
```

That will return an instance of Person using the attributes you defined in the
Fabricator.

To set additional attributes or override what is in the Fabricator, you can
pass a hash to Fabricate with the fields you want to set.

```ruby
Fabricate(:person, first_name: "Corbin", last_name: "Dallas")
```

The arguments to Fabricate always take precedence over anything defined in the
Fabricator.

#### Fabricating With Blocks

In addition to the hash, you can pass a block to Fabricate and all the features
of a Fabricator definition are available to you at object generation time.

```ruby
Fabricate(:person, name: "Franky Four Fingers") do
  addiction "Gambling"
  fingers(count: 9)
end
```

The hash will overwrite any fields defined in the block.

#### Building

If you don't want to persist the object to the database, you can use
`Fabricate.build` and skip the save step. All the normal goodness when
Fabricating is available for building as well.

```ruby
Fabricate.build(:person)
```

When you invoke a build, all other `Fabricate` calls will be processed as
`build` until the build completes. If the object being built causes other
objects to be generated, they will not be persisted to the database either.

For example, calling build on `person` will cascade down to `Fabricate(:car)`
and they will not be persisted either.

```ruby
Fabricate.build(:person) do
  cars { 2.times.map { Fabricate(:car) } }
end
```

#### Attributes Hash

You can receive any object back in the form of a hash. This processes all the
defined fields, but doesn't actually create or persist the object. If
`ActiveSupport` is available it will be a `HashWithIndifferentAccess`, otherwise it
will be a regular Ruby `Hash`.

```ruby
Fabricate.attributes_for(:company)
```

If the class you are getting the attributers for has a polymorphic
`belongs_to`, you will need to add the type field to the fabricator definition
if you want it in the generated parameters.

```ruby
Fabricator(:comment) do
  commentable(fabricator: :post)
  commentable_type { |attrs| attrs[:commentable].class.to_s }
end
```

#### Multiple Objects

You can create an array of objects by using the `times` method. It takes an
integer as the first argument and the rest has all the same goodness as the
standard `Fabricate` method.

```ruby
Fabricate.times(4, :company, name: 'Hashrocket') do
  type 'consultancy'
end

#=> an array with 4 company objects
```

### Sequences

A sequence allows you to get a series of numbers unique within the current
process. Fabrication provides you with an easy and flexible means for keeping
track of sequences.

You can create a sequence that starts at 0 anywhere in your app with a simple
command.

```ruby
Fabricate.sequence
  # => 0
  # => 1
  # => 2
```

You can name them by passing an argument to sequence.

```ruby
Fabricate.sequence(:name)
  # => 0
  # => 1
  # => 2
```

If you want to specify the starting number, you can do it with a second
parameter. It will always return the seed number on the first call and it will
be ignored with subsequent calls.

```ruby
Fabricate.sequence(:number, 99)
  # => 99
  # => 100
  # => 101
```

Alternatively, you can specify the starting point for all sequences globally
with a configuration setting. (See Configuration tab)

If you are generating something like an email address, you can pass it a block
and the block response will be returned.

```ruby
Fabricate.sequence(:name) { |i| "Name #{i}" }
  # => "Name 0"
  # => "Name 1"
  # => "Name 2"
```

You can use the shorthand notation if you are using them in your fabricators.

```ruby
Fabricate(:person) do
  ssn { sequence(:ssn, 111111111) }
  email { sequence(:email) { |i| "user#{i}@example.com" } }
end
# => <Person ssn: 111111111, email: "user0@example.com">
# => <Person ssn: 111111112, email: "user1@example.com">
# => <Person ssn: 111111113, email: "user2@example.com">
```

### Rails

If you are using rspec-rails and fabrication gem is present in the `:development` 
Bundler group, fabricators will be generated automatically when you generate
models.

To produce fabricators when you generate models with test-unit or minitest,
you need to configure the `test_framework` and `fixture_replacement` options
in your `config/application.rb`. Use this if you are using test-unit:

```ruby
config.generators do |g|
  g.test_framework      :test_unit, fixture_replacement: :fabrication
  g.fixture_replacement :fabrication, dir: "test/fabricators"
end
```

... or this if you are using minitest:

```ruby
config.generators do |g|
  g.test_framework      :minitest, fixture_replacement: :fabrication
  g.fixture_replacement :fabrication, dir: "test/fabricators"
end
```

Once it's setup, a fabricator will be generated whenever you generate a model.

```
rails generate model widget
```

Will produce:

```ruby
# test/fabricators/widget_fabricator.rb

Fabricator(:widget) do
end
```

### Cucumber Steps

#### Installing

Packaged with the gem is a generator which will load some handy cucumber steps
into your step_definitions folder.

```
rails generate fabrication:cucumber_steps
```

#### Step Definitions

With a Widget Fabricator defined, you can easily fabricate a single "widget".

```ruby
Given 1 widget
```

To fabricate a single "widget" with specified attributes:

```ruby
Given the following widget:
    | name      | widget_1 |
    | color     | red      |
    | adjective | awesome  |
```

To fabricate multiple "widgets":

```ruby
Given 10 widgets
```

To fabricate multiple "widgets" with specified attributes:

```ruby
Given the following widgets:
    | name     | color | adjective |
    | widget_1 | red   | awesome   |
    | widget_2 | blue  | fantastic |
    ...
```

To fabricate "wockets" that belong to widget you already fabricated:

```ruby
And that widget has 10 wockets
```

To fabricate "wockets" with specified attributes that belong to your widget:

```ruby
And that widget has the following wocket:
    | title    | Amazing |
    | category | fancy   |
```

That will use the most recently fabricated "widget" and pass it into the wocket
Fabricator. That requires your "wocket" to have a setter for a "widget".

In more complex cases where you've already created "widgets" and "wockets" and
associated them with other objects, to set up an association between the former
two:

```ruby
And that wocket belongs to that widget
```

You can verify that some number of objects were persisted to the database:

```ruby
Then I should see 1 widget in the database
```

You can also verify that a specific object was persisted:

```ruby
Then I should see the following widget in the database:
    | name  | Sprocket |
    | gears | 4        |
    | color | green    |
```

That will look up the class defined in the fabricator for "widget" and run a
where(...) with the parameterized table as an argument. It will verify that
there is only one of these objects in the database, so be specific!

#### Transforms

You can define transforms to apply to tables in the cucumber steps. They work
on both vertical and horizontal tables and allow you to remap column values.
You can provide string data and perform logic on it to set objects instead.
You can put them in your `spec/fabricators` folder or whatever you have
configured.

For example, you can define a transform on all fields named "company". It will
pass the strings from the cells into a lambda and set the return value to the
attribute, in effect replacing the supplied company name with an actual instance of the company in the generated object.

```ruby
Fabrication::Transform.define(:company, lambda{ |company_name| Company.where(name: company_name).first })
```

You can invoke it by putting the expected text in the cells and matching the
column name to the symbol.

```ruby
Scenario: a single object with transform to apply
  Given the following company:
    | name | Widgets Inc |
  Given the following division:
    | name    | Southwest   |
    | company | Widgets Inc |
  Then that division should reference that company
```

```ruby
Scenario: multiple objects with transform to apply
  Given the following company:
    | name | Widgets Inc |
  Given the following divisions:
    | name      | company     |
    | Southwest | Widgets Inc |
    | North     | Widgets Inc |
  Then they should reference that company
```

When the divisions are generated, they will receive the company object as
looked up by the lambda.

You can also scope them to a specific model with `only_for`.

```ruby
Fabrication::Transform.only_for(:division, :company, lambda { |company_name| Company.where(name: company_name).first })
```

### Extras

#### Getting Help

Email the fabrication [mailing list](https://groups.google.com/group/fabricationgem) if you need extra help or have specific questions.

You can also view the [raw version of this documentation](https://github.com/paulelliott/fabrication-site/blob/master/index.markdown).

If all else fails, open an [issue on GitHub](https://github.com/paulelliott/fabrication/issues).

#### Vim

Fabrication support is built into [rails.vim](https://github.com/tpope/vim-rails)! Once you install it, you can open Fabricator files like this:

```ruby
:Rfabricator your_fabricator
```

#### Make Syntax

If you are migrating to Fabrication from Machinist, you can include make syntax
to help ease the transition. Simply require `fabrication/syntax/make` and you
will get `make` and `make!` mixed into your classes.

You can also provide a suffix to the class's primary Fabricator.

```ruby
Fabricator(:author_with_books, from: :author) do
  books(count: 2)
end

Author.make(:with_books)
```

### Contributing

I ([paulelliott](http://github.com/paulelliott)) am actively maintaining this
project. If you would like to contribute, please fork the project, make your
changes with specs on a feature branch, and submit a pull request.

Naturally, the Fabrication source is [available on Github](https://github.com/paulelliott/fabrication) as is the source for the [Fabrication website](https://github.com/paulelliott/fabrication-site).

To run rake successfully:

1. Clone the project
2. Install mongodb and sqlite3 (brew install ...)
3. Install bundler (gem install bundler)
4. Run `bundle` from the project root
5. Run `rake` and the test suite should be all green!
