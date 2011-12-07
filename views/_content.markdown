### Installation

Fabrication is tested against Ruby 1.8.7, 1.9.2, 1.9.3, Rubinius, and REE.

To use it with Bundler, just add it to your gemfile.

    gem 'fabrication'

Fabricators defined in the right place are automatically loaded so no
additional requires are necessary.

    spec/fabricators/**/*fabricator.rb
    test/fabricators/**/*fabricator.rb

### Configuration

You can specify where the fabricators are loaded from with a configuration
option ...

    Fabrication.configure do |config|
      fabricator_dir = "data/fabricators"
    end

... or you can pass an array of locations.

    Fabrication.configure do |config|
      fabricator_dir = ["data/fabricators", "spec/fabricators"]
    end

### Defining Fabricators

#### Arguments

The first argument to the fabricator is the name you will use when fabricating
objects or defining associations. It should be the symbolized form of the class
name.

    class Person; end

    Fabricator(:person)

To use a different name from the class, you must specify `:from =>
:symbolized_class_name` as the second argument.

    Fabricator(:adult, :from => :person)

The value of `:from` can be either a class name or the name of another
fabricator.

#### Attributes

The block for the Fabricator does not take a block variable. You can simply
list the attributes to be generated and they will be created in order of
declaration.

    Fabricator(:person) do
      name 'Greg Graffin'
      profession 'Professor/Musician'
    end

To produce dynamic values, you can pass a block to the attribute.

    Fabricator(:person) do
      name { Faker::Name.name }
      profession { %w(Butcher Baker Candlestick\ Maker).sample }
    end

You can also access the current state of the object being generated with each
attribute. Note that attributes are processed in order of declaration, so only
fields above the current one will be available.

    Fabricator(:person) do
      name { Faker::Name.name }
      email { |person| "#{person.name.parameterize}@example.com" }
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
      ride(:fabricator => :vehicle)
    end

...is equivalent to...

    Fabricator(:person) do
      ride { Fabricate(:vehicle) }
    end

Fabrication will lazily generate ActiveRecord associations by default. If you
define `has_many :widgets`, it will wait to generate the widgets until the
getter for the association is accessed. You can override this by appending `!`
to the name of the association in the Fabricator. You would typically want to
do this in the case of a `belongs_to` or any other required association.

    Fabricator(:person) do
      mother!
      father!
    end

You can also generate arrays of objects with the count parameter. The attribute
block receives the object being generated as well as the incrementing value.

    Fabricator(:person) do
      children(:count => 3) { |parent, i| Fabricate(:person, :parent => parent) }
    end

#### Inheritance

You can inherit attributes from other fabricators by using the `:from` attribute.

    Fabricator(:llc, :from => :company) do
      type "LLC"
    end

Setting the `:from` option will inherit the class and all the attributes from the named Fabricator.

You can also explicitly specify the class being fabricated with the `:class_name` parameter.

    Fabricator(:llc, :class_name => :company) do
      type "LLC"
    end

#### Callbacks

You can specify callbacks in your Fabricator that are separate from the
object's callbacks.

If you have an object with required arguments in the constructor, you can use
the `on_init` callback to supply them.

    Fabricator(:location) do
      on_init { init_with(30.284167, -81.396111) }
    end

To hook into Fabrication's build cycle for the object, you can use
`after_build` and `after_create`.

    Fabricator(:place) do
      after_build { |place| place.geolocate! }
      after_create { |place| Fabricate(:restaurant, :place => place) }
    end

The callbacks are all stackable, meaning that you can declare multiple in a
fabricator and they will not be clobbered when you inherit another fabricator.

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

    Fabricate(:person, :first_name => "Corbin", :last_name => "Dallas")

The arguments to Fabricate always take precedence over anything defined in the
Fabricator.

#### Fabricating With Blocks

In addition to the hash, you can pass a block to Fabricate and all the features
of Fabricator's available to you at object generation time.

    Fabricate(:person, :name => "Franky Four Fingers") do
      addiction "Gambling"
      fingers(:count => 9)
    end

The hash will overwrite any fields defined in the block.

#### Building

If you are using an ORM with a `save` method, sometimes it is necessary to just
build and not actually save objects. In that case, you can use
`Fabricate.build` and skip the save step. All the normal goodness when
Fabricating is available for building as well.

    Fabricate.build(:person)

#### Attributes Hash

You can also receive the object back in the form of a hash. This processes all
the fields defined, but doesn't actually create the object. If you have
ActiveSupport it will be a HashWithIndifferentAccess, otherwise it will be a
regular Ruby hash.

    Fabricate.attributes_for(:company)

### Sequences

A sequence allows you to get a series of numbers unique within the current
process. Fabrication provides you with an easy and flexible means for keeping
track of sequences.

You can create a sequence that starts at 0 anywhere in your app with a simple
command.

    Fabricate.sequence

You can name them by passing an argument to sequence.

    Fabricate.sequence(:name)

If you want to specify the starting number, you can do it with a second
parameter. It will always return the seed number on the first call and it will
be ignored with subsequent calls.

    Fabricate.sequence(:number, 99)

If you are generating something like an email address, you can pass it a block
and the block response will be returned.

    Fabricate.sequence(:name) { |i| "Name #{i}" }

You can use the shorthand notation if you are using them in your fabricators.

    Fabricate(:person) do
      ssn { sequence(:ssn, 111111111) }
      email { sequence(:email) { |i| "user#{i}@example.com" } }
    end

### Rails 3

You can configure Rails 3 to produce fabricators when you generate models by
specifying it in your `config/application.rb`. Use this if you are using rspec:

    config.generators do |g|
      g.test_framework      :rspec, :fixture => true
      g.fixture_replacement :fabrication
    end

... and this if you are using test/unit:

    config.generators do |g|
      g.fixture_replacement :fabrication, :dir => "test/fabricators"
    end

Once it's setup, a fabricator will be generated whenever you generate a model.

    rails generate model widget

Will produce:

    spec/fabricators/widget_fabricator.rb

    Fabricator(:widget) do
    end

### Cucumber Steps

Packaged with the gem is a generator which will load some handy cucumber steps
into your step_definitions folder.

    rails generate fabrication:cucumber_steps

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

### Extras

Vim users can add Fabrication support by adding this to your .vimrc.

    autocmd User Rails Rnavcommand fabricator spec/fabricators -suffix=_fabricator.rb -default=model()

You can then open Fabricator files like this.

    :Rfabricator your_model

### Contributing

I ([paulelliott](http://github.com/paulelliott)) am actively maintaining this
project. If you would like to contribute, please fork the project, make your
changes on a feature branch, and submit a pull request.

Naturally, the Fabrication source is [available on Github](https://github.com/paulelliott/fabrication) as is the source for the [Fabrication website](https://github.com/paulelliott/fabrication-site).

To run rake successfully:

1. Clone the project
2. Install mongodb and sqlite3 (brew install ...)
3. Install bundler (gem install bundler)
4. Run `bundle` from the project root
5. Run `rake` and the test suite should be all green!
