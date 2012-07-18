### Installation

Fabrication is tested against Ruby 1.9.2, 1.9.3, and Rubinius.

(version 1.2.0 is the last release with 1.8 compatibility)

To use it with Bundler, just add it to your gemfile.

    gem 'fabrication'

Fabricators defined in the right place are automatically loaded so no
additional requires are necessary.

    spec/fabricators/**/*fabricator.rb
    test/fabricators/**/*fabricator.rb

### Configuration

To override these settings, put a fabrication.rb in your support folder with a configure block

    Fabrication.configure do |config|
      config.fabricator_path = 'data/fabricators'
      config.path_prefix = Rails.root
    end

#### Supported Options

##### fabricator_path

Specifies the path within your project where Fabricator definitions are located.

Default: ['test/fabricators', 'spec/fabricators']

##### path_prefix

Allows you to specify the location of your application on the file system. This is especially useful when working with Rails engines.

Default: Rails.root if defined, otherwise '.'

### Defining Fabricators

#### Arguments

The first argument to the fabricator is the name you will use when fabricating
objects or defining associations. It should be the symbolized form of the class
name.

    class Person; end

    Fabricator(:person)

To use a different name from the class, you must specify `from:
:symbolized_class_name` as the second argument.

    Fabricator(:adult, from: :person)

The value of `:from` can be either a class name or the name of another fabricator.

#### Attributes

The Fabricator block does not require a block variable, but one can be
supplied. You can list the attributes to be generated and they will be created
in order of declaration.

    Fabricator(:person) do
      name 'Greg Graffin'
      profession 'Professor/Musician'
    end

To produce dynamic values, you can pass a block to the attribute.

    Fabricator(:person) do
      name { Faker::Name.name }
      profession { %w(Butcher Baker Candlestick\ Maker).sample }
    end

Attributes are processed in order of declaration and fields above the current
one are available via a block parameter.

    Fabricator(:person) do
      name { Faker::Name.name }
      email { |attrs| "#{attrs[:name].parameterize}@example.com" }
    end

#### Reserved Words ####

You can reference fields whose names are reserved words with the block variable.

    Fabricator(:person) do |f|
      f.alias 'James Bond'
    end

#### Associations

You can associate another fabricator by just writing the attribute name.
Fabrication will look up a fabricator of that name, generate the object, and
set it in the current object. This is great for `belongs_to` associations.

    Fabricator(:person) do
      vehicle
    end

...is equivalent to...

    Fabricator(:person) do
      vehicle { Fabricate(:vehicle) }
    end

You can specify which fabricator to use in that situation as well.

    Fabricator(:person) do
      ride(fabricator: :vehicle)
    end

...is equivalent to...

    Fabricator(:person) do
      ride { Fabricate(:vehicle) }
    end

You can also generate arrays of objects with the count parameter. The attribute
block receives the object being generated as well as the incrementing value. It works just like you would expect if you leave off the block.

    Fabricator(:person) do
      open_souce_projects(count: 5)
      children(count: 3) { |attrs, i| Fabricate(:person, name: "Kid #{i}") }
    end

#### Inheritance

You can inherit attributes from other fabricators by using the `:from` attribute.

    Fabricator(:llc, from: :company) do
      type "LLC"
    end

Setting the `:from` option will inherit the class and all the attributes from the named Fabricator.

You can also explicitly specify the class being fabricated with the `:class_name` parameter.

    Fabricator(:llc, class_name: :company) do
      type "LLC"
    end

#### Custom Initialization

If you don't want to build the object through the normal initialization means, you can override it with the `initialize_with` option.

    Fabricator(:car) do
      initialize_with { Manufacturer.produce(:new_car) }
      color 'red'
    end

The object instantiated and returned by the initialize_with block will have all the defined attributes applied and it will be returned by the Fabricate method call.

#### Callbacks

You can specify callbacks in your Fabricator that are separate from the
object's callbacks.

To hook into Fabrication's build cycle for the object, you can use
`after_build` and `after_create`.

    Fabricator(:place) do
      after_build { |place| place.geolocate! }
      after_create { |place| Fabricate(:restaurant, place: place) }
    end

If you have an object with required arguments in the constructor, you can use
the `on_init` callback to supply them.

    Fabricator(:location) do
      on_init { init_with(30.284167, -81.396111) }
    end

The callbacks are all stackable, meaning that you can declare multiple in a
fabricator and they will not be clobbered when you inherit another fabricator.

#### Aliases

You can provide aliases for a fabricator by supplying the :aliases option to
the Fabricator call.

    Fabricator(:thingy, aliases: [:widget, :wocket])

You can now call Fabricate with :thingy, :widget, or :wocket and receive back
the generated object.

#### Transient Attributes

Transient attributes allow you to have variables in the Fabricator that are not
set in the generated class. You can interact with them during attribute
generation as if they were regular attributes, but they are stripped out when
the attributes are mass-assigned to the object.

    Fabricator(:city) do
      transient :asian
      name { |attrs| attrs[:asian] ? "Tokyo" : "Stockholm" }
    end

    Fabricate(:city, asian: true)
    # => <City name: 'Tokyo'>

You can specify multiple transients by passing them all to `transient`.

    Fabricator(:the_count) do
      transient :one, :two, :three
    end

#### Reloading

If you need to reset fabrication back to its original state after it has been
loaded, call:

    Fabrication.clear_definitions

This is useful if you are using something like Spork and reloading the whole
environment is not desirable.

### Fabricating Objects

#### The Basics

The simplest way to Fabricate an object is to pass the Fabricator name into
Fabricate.

    Fabricate(:person)

That will return an instance of Person using the attributes you defined in the
Fabricator.

To set additional attributes or override what is in the Fabricator, you can
pass a hash to Fabricate with the fields you want to set.

    Fabricate(:person, first_name: "Corbin", last_name: "Dallas")

The arguments to Fabricate always take precedence over anything defined in the
Fabricator.

#### Fabricating With Blocks

In addition to the hash, you can pass a block to Fabricate and all the features
of a Fabricator definition are available to you at object generation time.

    Fabricate(:person, name: "Franky Four Fingers") do
      addiction "Gambling"
      fingers(count: 9)
    end

The hash will overwrite any fields defined in the block.

#### Building

If you don't want to persist the object to the database, you can use
`Fabricate.build` and skip the save step. All the normal goodness when
Fabricating is available for building as well.

    Fabricate.build(:person)

When you invoke a build, all other `Fabricate` calls will be processed as
`build` until the build completes. If the object being built causes other
objects to be generated, they will not be persisted to the database either.

For example, calling build on `person` will cascade down to `Fabricate(:car)`
and they will not be persisted either.

    Fabricate.build(:person) do
      cars { 2.times { Fabricate(:car) } }
    end

#### Attributes Hash

You can receive any object back in the form of a hash. This processes all the
defined fields, but doesn't actually create or persist the object. If
`ActiveSupport` is available it will be a `HashWithIndifferentAccess`, otherwise it
will be a regular Ruby `Hash`.

    Fabricate.attributes_for(:company)

### Sequences

A sequence allows you to get a series of numbers unique within the current
process. Fabrication provides you with an easy and flexible means for keeping
track of sequences.

You can create a sequence that starts at 0 anywhere in your app with a simple
command.

    Fabricate.sequence
    # => 0
    # => 1
    # => 2

You can name them by passing an argument to sequence.

    Fabricate.sequence(:name)
    # => 0
    # => 1
    # => 2

If you want to specify the starting number, you can do it with a second
parameter. It will always return the seed number on the first call and it will
be ignored with subsequent calls.

    Fabricate.sequence(:number, 99)
    # => 99
    # => 100
    # => 101

If you are generating something like an email address, you can pass it a block
and the block response will be returned.

    Fabricate.sequence(:name) { |i| "Name #{i}" }
    # => "Name 0"
    # => "Name 1"
    # => "Name 2"

You can use the shorthand notation if you are using them in your fabricators.

    Fabricate(:person) do
      ssn { sequence(:ssn, 111111111) }
      email { sequence(:email) { |i| "user#{i}@example.com" } }
    end
    # => <Person ssn: 111111111, email: "user0@example.com">
    # => <Person ssn: 111111112, email: "user1@example.com">
    # => <Person ssn: 111111113, email: "user2@example.com">

### Rails 3

You can configure Rails 3 to produce fabricators when you generate models by
specifying it in your `config/application.rb`. Use this if you are using rspec:

    config.generators do |g|
      g.test_framework      :rspec, fixture: true
      g.fixture_replacement :fabrication
    end

... and this if you are using test/unit:

    config.generators do |g|
      g.test_framework      :test_unit, fixture_replacement: :fabrication
      g.fixture_replacement :fabrication, dir: "test/fabricators"
    end

Once it's setup, a fabricator will be generated whenever you generate a model.

    rails generate model widget

Will produce:

    spec/fabricators/widget_fabricator.rb

    Fabricator(:widget) do
    end

### Cucumber Steps

#### Installing

Packaged with the gem is a generator which will load some handy cucumber steps
into your step_definitions folder.

    rails generate fabrication:cucumber_steps

#### Step Definitions

With a Widget Fabricator defined, you can easily fabricate a single "widget".

    Given 1 widget

To fabricate a single "widget" with specified attributes:

    Given the following widget:
      | name      | widget_1 |
      | color     | red      |
      | adjective | awesome  |

To fabricate multiple "widgets":

    Given 10 widgets

To fabricate multiple "widgets" with specified attributes:

    Given the following widgets:
      | name     | color | adjective |
      | widget_1 | red   | awesome   |
      | widget_2 | blue  | fantastic |
      ...

To fabricate "wockets" that belong to widget you already fabricated:

    And that widget has 10 wockets

To fabricate "wockets" with specified attributes that belong to your widget:

    And that widget has the following wocket:
      | title    | Amazing |
      | category | fancy   |

That will use the most recently fabricated "widget" and pass it into the wocket
Fabricator. That requires your "wocket" to have a setter for a "widget".

In more complex cases where you've already created "widgets" and "wockets" and
associated them with other objects, to set up an association between the former
two:

    And that wocket belongs to that widget

You can verify that some number of objects were persisted to the database:

    Then I should see 1 widget in the database

You can also verify that a specific object was persisted:

    Then I should see the following widget in the database:
      | name  | Sprocket |
      | gears | 4        |
      | color | green    |

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

    Fabrication::Transform.define(:company, lambda{ |company_name| Company.where(name: company_name).first })

You can invoke it by putting the expected text in the cells and matching the
column name to the symbol.

    Scenario: a single object with transform to apply
      Given the following company:
        | name | Widgets Inc |
      Given the following division:
        | name    | Southwest   |
        | company | Widgets Inc |
      Then that division should reference that company

    Scenario: multiple objects with transform to apply
      Given the following company:
        | name | Widgets Inc |
      Given the following divisions:
        | name      | company     |
        | Southwest | Widgets Inc |
        | North     | Widgets Inc |
      Then they should reference that company

When the divisions are generated, they will receive the company object as
looked up by the lambda.

You can also scope them to a specific model with `only_for`.

    Fabrication::Transform.only_for(:division, :company, lambda { |company_name| Company.where(name: company_name).first })

### Extras

#### Getting Help

Email the fabrication [mailing list](https://groups.google.com/group/fabricationgem) if you need extra help or have specific questions.

You can also view the [raw version of this documentation](https://github.com/paulelliott/fabrication-site/blob/master/views/_content.markdown).

#### Vim

Vim users can add Fabrication support by adding this to your .vimrc.

    autocmd User Rails Rnavcommand fabricator spec/fabricators -suffix=_fabricator.rb -default=model()

You can then open Fabricator files like this.

    :Rfabricator your_model

#### Make Syntax

If you are migrating to Fabrication from Machinist, you can include make syntax
to help ease the transition. Simply require `fabrication/syntax/make` and you
will get `make` and `make!` mixed into your classes.

You can also provide a suffix to the class's primary Fabricator.

    Fabricator(:author_with_books, from: :author) do
      books(count: 2)
    end

    Author.make(:with_books)

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
