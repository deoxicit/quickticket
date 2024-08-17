// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract QuickTick {
    struct Event {
        uint256 id;
        address creator;
        string name;
        uint256 date;
        uint256 ticketPrice;
        uint256 maxParticipants;
        uint256 ticketsSold;
        bool isActive;
        string imageUrl;
        string description;
        string location;
    }

    struct TicketInfo {
        uint256 eventId;
        uint256 ticketCount;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => uint256)) public ticketsPurchased;
    
    uint256 public eventCount;

    event EventCreated(uint256 eventId, address creator, string name, uint256 date, uint256 ticketPrice, uint256 maxParticipants, string imageUrl, string description, string location);
    event TicketPurchased(uint256 eventId, address buyer, uint256 quantity);
    event EventCancelled(uint256 eventId);
    event TicketsRefunded(uint256 eventId, address buyer, uint256 quantity);

    modifier eventExists(uint256 _eventId) {
        require(_eventId > 0 && _eventId <= eventCount, "Event does not exist");
        _;
    }

    modifier onlyEventCreator(uint256 _eventId) {
        require(events[_eventId].creator == msg.sender, "Only event creator can perform this action");
        _;
    }

    function createEvent(
        string memory _name,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        string memory _imageUrl,
        string memory _description,
        string memory _location
    ) public {
        require(_date > block.timestamp, "Event date must be in the future");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(bytes(_imageUrl).length > 0, "Image URL must not be empty");

        eventCount++;
        events[eventCount] = Event({
            id: eventCount,
            creator: msg.sender,
            name: _name,
            date: _date,
            ticketPrice: _ticketPrice,
            maxParticipants: _maxParticipants,
            ticketsSold: 0,
            isActive: true,
            imageUrl: _imageUrl,
            description: _description,
            location: _location
        });

        emit EventCreated(eventCount, msg.sender, _name, _date, _ticketPrice, _maxParticipants, _imageUrl, _description, _location);
    }

    function buyTicket(uint256 _eventId, uint256 _quantity) public payable eventExists(_eventId) {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is not active");
        require(block.timestamp < event_.date, "Event has already occurred");
        require(event_.ticketsSold + _quantity <= event_.maxParticipants, "Not enough tickets available");
        require(msg.value >= event_.ticketPrice * _quantity, "Insufficient payment");

        ticketsPurchased[_eventId][msg.sender] += _quantity;
        event_.ticketsSold += _quantity;

        // Refund excess payment
        if (msg.value > event_.ticketPrice * _quantity) {
            payable(msg.sender).transfer(msg.value - (event_.ticketPrice * _quantity));
        }

        emit TicketPurchased(_eventId, msg.sender, _quantity);
    }

    function cancelEvent(uint256 _eventId) public eventExists(_eventId) onlyEventCreator(_eventId) {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is already cancelled");
        
        event_.isActive = false;
        emit EventCancelled(_eventId);
    }

    function refundTickets(uint256 _eventId) public eventExists(_eventId) {
        Event storage event_ = events[_eventId];
        require(!event_.isActive, "Event is still active");
        
        uint256 ticketCount = ticketsPurchased[_eventId][msg.sender];
        require(ticketCount > 0, "No tickets to refund");

        uint256 refundAmount = event_.ticketPrice * ticketCount;
        ticketsPurchased[_eventId][msg.sender] = 0;
        event_.ticketsSold -= ticketCount;

        payable(msg.sender).transfer(refundAmount);
        emit TicketsRefunded(_eventId, msg.sender, ticketCount);
    }

    function getEvent(uint256 _eventId) public view eventExists(_eventId) returns (
        uint256 id,
        address creator,
        string memory name,
        uint256 date,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 ticketsSold,
        bool isActive,
        string memory imageUrl,
        string memory description,
        string memory location
    ) {
        Event storage event_ = events[_eventId];
        return (
            event_.id,
            event_.creator,
            event_.name,
            event_.date,
            event_.ticketPrice,
            event_.maxParticipants,
            event_.ticketsSold,
            event_.isActive,
            event_.imageUrl,
            event_.description,
            event_.location
        );
    }

    function getTicketsPurchased(uint256 _eventId, address _buyer) public view eventExists(_eventId) returns (uint256) {
        return ticketsPurchased[_eventId][_buyer];
    }

    function withdrawEventProceeds(uint256 _eventId) public eventExists(_eventId) onlyEventCreator(_eventId) {
        Event storage event_ = events[_eventId];
        require(block.timestamp > event_.date, "Event has not occurred yet");
        
        uint256 amount = event_.ticketPrice * event_.ticketsSold;
        require(amount > 0, "No proceeds to withdraw");

        payable(msg.sender).transfer(amount);
    }

    function getEventCount() public view returns (uint256) {
        return eventCount;
    }

    function hasTickets(uint256 _eventId, address _buyer) public view eventExists(_eventId) returns (bool) {
        return ticketsPurchased[_eventId][_buyer] > 0;
    }

    function getAllTicketsPurchased(address _buyer) public view returns (TicketInfo[] memory) {
        uint256 purchasedEventCount = 0;

        // First, count how many events the buyer has tickets for
        for (uint256 i = 1; i <= eventCount; i++) {
            if (ticketsPurchased[i][_buyer] > 0) {
                purchasedEventCount++;
            }
        }

        // Create an array to store the results
        TicketInfo[] memory purchasedTickets = new TicketInfo[](purchasedEventCount);

        // Fill the array with the event IDs and ticket counts
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= eventCount; i++) {
            uint256 ticketCount = ticketsPurchased[i][_buyer];
            if (ticketCount > 0) {
                purchasedTickets[currentIndex] = TicketInfo(i, ticketCount);
                currentIndex++;
            }
        }

        return purchasedTickets;
    }
}