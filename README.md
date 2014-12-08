Hackatron-Asia-SVG-Card-Game
============================

A turn-based real-time multiplayer card game with innovative new rules built during Hackatron Asia 2014 hackathon. The card game was built using an existing card library and sockets to create an interaction between multiple users.

How To Play
----------
The aim of the game is to have the minimum sum of the three cards in the player's hand at the end of the game. Ace carries 1 point and all the face cards carry 10 points each. The remaining cards carry the same points as their value.

Three cards are delt to each player at the start of the game which once memorised will be placed face down. Cards are now picked from the deck of remaining cards based on the player's turn and the player can either choose to drop the drawn card or swap the drawn card for any of the existing cards held by the player.

Face cards when dropped have special powers:
* 10 - Allows a player to view another player's cards during that turn.
* J - Allows a player to shuffle another player's cards. Once used the player whose cards are shuffled would no longer know the order of his cards.
* Q - Allows a player to swap one of his cards with any card belonging to the other players.
* K - Allows a player to see his own cards.
